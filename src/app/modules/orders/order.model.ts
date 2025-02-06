import mongoose, { Schema, Types } from 'mongoose';
import { IComment, ICoordinates, IOrder, ITasks } from './order.interface';

const Coordinates = new Schema<ICoordinates>({
    type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
    },
    coordinates: {
        type: [Number],
        required: true,
        validate: {
            validator: function (arr: number[]) {
                return arr.length === 2;
            },
            message: 'Coordinates must be an array of two numbers (longitude, latitude).',
        },
    },
});

const orderSchema = new Schema<IOrder>(
    {
        clientId: {
            type: Schema.Types.ObjectId,
            ref: 'Client',
            required: true,
        },
        packageIds: {
            type: [Types.ObjectId],
            ref: 'Package',
            default: [],
        },
        serviceIds: {
            type: [Types.ObjectId],
            ref: 'Service',
            default: [],
        },
        locations: Coordinates,
        address: {
            zipCode: { type: String, required: true },
            streetName: { type: String, required: true },
            streetAddress: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
        },
        pickupKeyOffice: { type: Boolean, default: false },
        contactAgent: { type: Boolean, default: false },
        contactOwner: { type: Boolean, default: false },
        contactInfo: {
            name1: { type: String },
            email1: { type: String },
            phone1: { type: String },
            name2: { type: String },
            email2: { type: String },
            phone2: { type: String },
        },
        linkedAgents: {
            type: [Types.ObjectId],
            ref: 'Agent',
            default: [],
        },
        uploadFiles: {
            type: [String],
            default: [],
        },
        descriptions: { type: String },
        notes: [{
            text: { type: String },
            memberId: { type: Types.ObjectId, ref: 'Member' },
            date: { type: Date, default: Date.now },
        }],
        schedule: [{
            date: { type: Date },
            start_time: { type: String },
            end_time: { type: String },
            memberId: [{ type: Types.ObjectId, ref: 'Member' }],
        }],
        totalAmount: { type: Number, required: true },
        status: {
            type: String,
            enum: [
                'Submitted',
                'Scheduled',
                'In-Production',
                'Delivered',
                'Revisions',
                'Completed',
            ],
            default: 'Submitted',
        },
        paymentStatus: {
            type: String,
            enum: ['Invoiced', 'Unpaid', 'Paid'],
            default: 'Unpaid',
        },
    },
    { timestamps: true }
);
orderSchema.index({ locations: '2dsphere' });

// ===================================
const taskSchema = new Schema<ITasks>({
    orderId: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    serviceId: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    memberId: {
        type: Schema.Types.ObjectId,
        ref: 'Member',
        default: null,
    },
    sourceFile: {
        type: [{
            url: String,
        }],
        default: [],
    },
    finishFile: {
        type: [{
            url: String,
        }],
        default: [],
    }
});

const commentSchema = new Schema<IComment>({
    orderId: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    fileId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    replayId: {
        type: Types.ObjectId,
        default: null
    },
    comment: [{
        text: String,
        userId: {
            type: Types.ObjectId,
            refPath: 'userType',
            required: true,
        },
        userType: {
            type: String,
            enum: ['Member', 'Agent', 'Client'],
            required: true,
        }
    }]
});


const Orders = mongoose.model<IOrder>('Order', orderSchema);
const Tasks = mongoose.model<ITasks>('Task', taskSchema);
const Comment = mongoose.model<IComment>('Comment', commentSchema);

export { Orders, Tasks, Comment };

