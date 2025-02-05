import mongoose, { Schema, Types } from 'mongoose';
import { ICoordinates, IOrder } from './order.interface';

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
            type: [{ url: String }],
            default: [],
        },
        descriptions: { type: String },
        notes: [{
            text: { type: String },
            memberId: { type: Types.ObjectId, ref: 'Member' },
            date: { type: Date, default: Date.now },
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

const Orders = mongoose.model('Order', orderSchema);

export default { Orders };
