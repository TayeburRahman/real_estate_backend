import mongoose, { Model, Schema } from 'mongoose';
import { INotification } from './notifications.interface';

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    types: {
      type: String,
      enum: ['member', 'client'],
    },
    status: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    }
    // plan_id: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'Plan',
    // },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);
const Notification: Model<INotification> = mongoose.model(
  'Notification',
  notificationSchema,
);

export default Notification;
