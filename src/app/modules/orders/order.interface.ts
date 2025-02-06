import { Types } from 'mongoose';

export type ICoordinates = {
    type: 'Point';
    coordinates: [number, number];
};

export interface IOrder {
    clientId: Types.ObjectId;
    packageIds?: Types.ObjectId[];
    serviceIds?: Types.ObjectId[];
    locations: ICoordinates;
    address: {
        zipCode: string;
        streetName: string;
        streetAddress: string;
        city: string;
        state: string;
    };
    pickupKeyOffice?: boolean;
    contactAgent: boolean;
    contactOwner: boolean;
    contactInfo?: {
        name1: string;
        email1: string;
        phone1: string;
        name2?: string;
        email2?: string;
        phone2?: string;
    };
    linkedAgents?: Types.ObjectId[];
    uploadFiles?: string[];
    descriptions?: string;
    notes?: {
        text?: string;
        memberId?: Types.ObjectId;
        date?: Date;
    }[];
    schedule?: {
        date: Date;
        start_time: string;
        end_time: string;
        memberId?: Types.ObjectId[];
    };
    totalAmount: number;
    status: 'Submitted' | 'Scheduled' | 'In-Production' | 'Delivered' | 'Revisions' | 'Completed';
    paymentStatus: 'Invoiced' | 'Unpaid' | 'Paid';
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ITasks {
    orderId: Types.ObjectId;
    serviceId: Types.ObjectId;
    memberId: Types.ObjectId | null;
    sourceFile?: {
        url: string;
    }[];
    finishFile?: {
        url: string;
        comment?: {
            text: string;
            userId: Types.ObjectId;
            userType: 'Member' | 'Agent' | 'Client';
            replayId: Types.ObjectId | null;
        }[];
    }[];
}

export interface IComment {
    orderId: Types.ObjectId;
    fileId: Types.ObjectId;
    replayId: Types.ObjectId | null;
    comment: {
        text: string;
        userId: Types.ObjectId;
        userType: 'Member' | 'Agent' | 'Client';
    };
}

