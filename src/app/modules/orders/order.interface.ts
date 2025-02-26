import { Types } from 'mongoose';

export type ICoordinates = {
    type: 'Point';
    coordinates: [number, number];
};



export interface IOrder {
    clientId: Types.ObjectId;
    packageIds?: Types.ObjectId[];
    serviceIds?: Types.ObjectId[];
    orderPlaced: {
        userId: Types.ObjectId | null;
        userType: "Member" | "Client";
    };
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
    status: 'Progress' | 'Completed';
    paymentStatus: 'Invoiced' | 'Unpaid' | 'Paid';

    taskIds: Types.ObjectId[] | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ITasks {
    orderId: Types.ObjectId;
    serviceId: Types.ObjectId;
    schedule_memberId: Types.ObjectId[];
    memberId: Types.ObjectId[] | null;
    sourceFile?: {
        url: string;
    }[];
    createdAt: Date,
    assigned: boolean
    status: string;
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
    taskId: Types.ObjectId;
    replayId: Types.ObjectId | null;
    isRevision: boolean;
    comment: {
        text: string;
        userId: Types.ObjectId;
        // userType: 'Member' | 'Agent' | 'Client';
    };
}

export interface CreateTasksInput {
    uniqueServices: Set<Types.ObjectId>;
    orderId: Types.ObjectId;
}

export interface ISchedule {
    date: Date;
    start_time: string;
    end_time: string;
    memberId: Types.ObjectId[];
}

export interface GetAllOrderQuery extends Record<string, unknown> {
    searchTerm?: string;
    category?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: string;
    fields?: string;
    status?: string
}

export interface INotes {
    text?: string;
    memberId?: Types.ObjectId;
    date?: Date;
}

// ============ 

export interface IOrderResponse {
    _id: Types.ObjectId;
    orderId: Types.ObjectId;
    client: {
        name: string;
        email: string;
    };
    address: string;
    totalTasks: number;
    status: string;
    createdAt: Date;
}

export interface IPaginationMeta {
    totalOrders: number;
    currentPage: number;
    totalPages: number;
}

