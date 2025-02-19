import mongoose, { Schema, Types } from 'mongoose';
import { IComment, ICoordinates, IOrder, ITasks } from './order.interface';
import { ENUM_USER_ROLE } from '../../../enums/user';

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
        totalAmount: { type: Number, required: true },
        locations: Coordinates,
        address: {
            zipCode: { type: String, required: true },
            streetName: { type: String, required: true },
            streetAddress: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String },
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
        schedule: {
            date: { type: Date },
            start_time: { type: String },
            end_time: { type: String },
            memberId: [{ type: Types.ObjectId, ref: 'Member' }],
        },

        taskIds: {
            type: [Schema.Types.ObjectId],
            default: null,
            ref: 'Task',
        },
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
        type: [Schema.Types.ObjectId],
        ref: 'Member',
        default: null,
    },
    assigned: {
        type: Boolean,
        default: false,
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
            status: {
                type: String,
                enum: ['Completed', 'Revision'],
                default: 'Completed'
            }
        }],
        default: [],
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Revision'],
        default: 'Pending'
    }
}, { timestamps: true });

const commentSchema = new Schema<IComment>({
    taskId: {
        type: Schema.Types.ObjectId,
        ref: 'Task',
        required: true,
    },
    fileId: {
        type: Schema.Types.ObjectId,
    },
    replayId: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    comment: {
        text: {
            type: String,
            required: true,
        },
        userId: {
            type: Types.ObjectId,
            refPath: 'userType',
            required: true,
        },
        userType: {
            type: String,
            enum: ENUM_USER_ROLE,
            required: true,
        }
    }
});


const Orders = mongoose.model<IOrder>('Order', orderSchema);
const Tasks = mongoose.model<ITasks>('Task', taskSchema);
const Comment = mongoose.model<IComment>('Comment', commentSchema);

export { Orders, Tasks, Comment };

