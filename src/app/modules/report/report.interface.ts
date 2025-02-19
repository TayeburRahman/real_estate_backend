import { Types } from "mongoose";

export interface IOrder {
    _id: Types.ObjectId;
    serviceIds: Types.ObjectId[];
    packageIds: Types.ObjectId[];
    clientId: Types.ObjectId;
    totalAmount: number;
}

export interface IService {
    _id: Types.ObjectId;
    title: string;
}

export interface IPackage {
    _id: Types.ObjectId;
    name: string;
}

export interface IClient {
    _id: Types.ObjectId;
    name: string;
    phoneNumber: string;
    address: string;
}