import { Schema, Types } from "mongoose";

export interface IInvoice extends Document {
    totalAmount: number;
    orderIds: Schema.Types.ObjectId[];
    status: string;
    clientId: Schema.Types.ObjectId;
    date: Date;
}