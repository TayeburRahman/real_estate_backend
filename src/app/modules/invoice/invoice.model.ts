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



const Invoice = mongoose.model<IInvoice>('Invoice', invoiceSchema);
export { Invoice };