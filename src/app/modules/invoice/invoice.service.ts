import httpStatus from "http-status";
import { Package, Service } from "../service/service.model";
import { Orders } from "../orders/order.model";
import { Types } from "mongoose";
import ApiError from "../../../errors/ApiError";
import Client from "../client/client.model";
import Member from "../member/member.model";
import { IMember } from "../member/member.interface";
import { IInvoice } from "./invoice.interface";
import { IReqUser } from "../auth/auth.interface";
import { Invoice } from "./invoice.model";


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

        return newInvoice;
    } catch (error: any) {
        throw new ApiError(500, error.message || "Failed to create invoice.");
    }
};

const getClientOrderInvoice = async (payload: any, user: IReqUser) => {

    const { clientId, searchTerm, page, limit } = payload;

    if (!clientId) {
        throw new ApiError(400, "Client ID and search term are required.");
    }



}


export const InvoiceService = {
    createOrderInvoice,
    getClientOrderInvoice
}