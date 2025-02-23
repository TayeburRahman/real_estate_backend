import mongoose, { Schema, Types } from "mongoose";
import { IInvoice } from "./invoice.interface";

const invoiceSchema = new Schema<IInvoice>(
    {
        clientId: {
            type: Types.ObjectId,
            ref: "Client",
            required: true
        },
        totalAmount: {
            type: Number,
            required: true
        },
        orderIds: [{
            type: Types.ObjectId,
            ref: "Order",
            required: true
        }],
        status: {
            type: String,
            enum: ["Invoiced", "Paid", "Cancelled"],
            default: "Invoiced"
        },
        date: {
            type: Date,
            required: true,
            default: Date.now
        },
    },
    { timestamps: true }
);


const transactionSchema = new Schema({
    invoiceId: {
        type: Types.ObjectId,
        ref: 'Invoice',
        required: true,
    },
    userId: {
        type: Types.ObjectId,
        refPath: 'Client',
        required: true,
    },
    amount: {
        type: Number
    },
    transactionId: {
        type: String,
        trim: true,
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ['Completed', 'Pending', 'Failed', 'Refunded'],
        required: true,
    },
    paymentDetails: {
        email: {
            type: String,
        },
        payId: {
            type: String,
        },
        currency: {
            type: String,
            default: 'USD',
        },
    }
}, { timestamps: true });


const Transaction = mongoose.model<IInvoice>('Transaction', transactionSchema);
const Invoice = mongoose.model<IInvoice>('Invoice', invoiceSchema);
export { Invoice, Transaction };