import httpStatus from "http-status";
import { Orders } from "../orders/order.model";
import ApiError from "../../../errors/ApiError";

import { IInvoice } from "./invoice.interface";
import { IReqUser } from "../auth/auth.interface";
import { Invoice, Transaction } from "./invoice.model";
import QueryBuilder from "../../../builder/QueryBuilder";
import config from "../../../config";
import Client from "../client/client.model";
import { IClient } from "../client/client.interface";
import { NotificationService } from "../notifications/notifications.service";
import { sendMessageEmail } from "../../../mails/sendMessageEmail";
import { invoiceEmailHtmlContent } from "./invoiceEmailHtmlContent";
const stripe = require("stripe")(config.stripe.stripe_secret_key);
const DOMAIN_URL = process.env.RESET_PASS_UI_LINK;

const createOrderInvoice = async (payload: IInvoice, user: IReqUser) => {
    try {
        if (!payload.orderIds || payload.orderIds.length === 0) {
            throw new ApiError(400, "At least one order ID is required.");
        }

        if (!payload.clientId) {
            throw new ApiError(400, "At least one client ID is required.");
        }

        if (!payload.totalAmount) {
            throw new ApiError(400, "Total amount is required.");
        }

        const orders = await Orders.find({ _id: { $in: payload.orderIds } });

        if (orders.length === 0) {
            throw new ApiError(404, "No orders found for the provided IDs.");
        }

        await Orders.updateMany(
            { _id: { $in: payload.orderIds } },
            { $set: { paymentStatus: "Invoiced" } }
        );

        const newInvoice = new Invoice({
            totalAmount: payload.totalAmount,
            orderIds: payload.orderIds,
            clientId: payload.clientId,
            status: "Invoiced",
            date: payload.date || Date.now(),
        });

        await newInvoice.save();

        await NotificationService.sendNotification({
            types: "client",
            user: payload.clientId,
            message: "An invoice has been generated for your orders. Please review the details in your account invoice.",
            title: "Invoice Created"
        });
        const client = await Client.findById(payload.clientId)
        if (client?.email_invoice) {
            await sendMessageEmail(
                client.email as string,
                "Invoice Notification",
                invoiceEmailHtmlContent({
                    name: client.name,
                    invoiceNumber: newInvoice._id.toString(),
                    totalAmount: payload.totalAmount.toString(),
                    dueDate: new Date(newInvoice.date).toLocaleDateString(),
                    totalOrder: orders.length.toString()
                })
            );
        }


        return newInvoice;
    } catch (error: any) {
        throw new ApiError(500, error.message || "Failed to create invoice.");
    }
};

const getClientOrderInvoice = async (query: any, user: IReqUser) => {

    const { clientId, searchTerm, page, limit } = query;

    if (!clientId) {
        throw new ApiError(400, "Client ID and search term are required.");
    }

    const userQuery = new QueryBuilder(Invoice.find({ clientId: query.clientId })
        .populate('orderIds', 'schedule totalAmount address')
        .select('totalAmount orderIds status date'), query)
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await userQuery.modelQuery;
    const meta = await userQuery.countTotal();

    return {
        meta,
        data: result,
    };

}
// =====================
const createCheckoutSessionStripe = async (req: any) => {
    try {
        const { invoiceId, price } = req.query as any;
        const { userId, role } = req.user as IReqUser;

        if (!invoiceId) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Missing required fields.');
        }

        const user = await Client.findById(userId) as IClient;
        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, 'User not found.');
        }

        const invoice = await Invoice.findById(invoiceId)
        if (!invoice) {
            throw new ApiError(httpStatus.NOT_FOUND, 'invalid invoice ID.');
        }

        const unitAmount = Number(invoice.totalAmount) * 100;



        let session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            success_url: `${DOMAIN_URL}/dashboard/invoice-order?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${DOMAIN_URL}/cancel`,
            customer_email: `${user?.email}`,
            client_reference_id: invoiceId,
            metadata: {
                payUser: userId,
                invoiceId: invoiceId,
            },
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        unit_amount: unitAmount,
                        product_data: {
                            name: "Service Payment From Invoice",
                            description: `Invoice ID: ${invoice?._id}`
                        }
                    },
                    quantity: 1
                }
            ]
        })

        return { url: session.url };

    } catch (error: any) {
        throw new ApiError(400, error);
    }
};

const stripeCheckAndUpdateStatusSuccess = async (req: any) => {
    const sessionId = req.query.session_id;

    if (!sessionId) {
        return { status: "failed", message: "Missing session ID in the request." };
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (!session) {
            return { status: "failed", message: "Session not found." };
        }

        if (session.payment_status !== 'paid') {
            return { status: "failed", message: "Payment not approved." };
        }

        const { orderIds, payUser, invoiceId } = session.metadata;

        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) {
            return {
                status: "failed",
                message: "Invoice not found!",
                text: 'Payment succeeded, but the invoice could not be found. Please contact support.'
            };
        }

        for (const order of invoice.orderIds) {
            const update = await Orders.findByIdAndUpdate(order, { $set: { paymentStatus: 'Paid' } });
            console.log(update)
        }

        invoice.status = 'Paid';
        await invoice.save();

        const amount = Number(session.amount_total) / 100;

        // Create transaction data
        const transactionData = {
            invoiceId,
            payUser,
            userId: payUser,
            amount: amount,
            paymentStatus: "Completed",
            isFinish: false,
            transactionId: session.payment_intent,
            paymentDetails: {
                email: session.customer_email,
                payId: sessionId,
                currency: "USD"
            }
        };

        const newTransaction = await Transaction.create(transactionData);

        return { status: "success", result: newTransaction };

    } catch (error: any) {
        console.error('Error processing Stripe payment:', error);
        return { status: "failed", message: "Payment execution failed", error: error.message };
    }
};

export const InvoiceService = {
    createOrderInvoice,
    getClientOrderInvoice,
    createCheckoutSessionStripe,
    stripeCheckAndUpdateStatusSuccess
}