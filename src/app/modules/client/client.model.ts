import mongoose, { Schema, Model } from 'mongoose';
import { IClient } from './client.interface';
import { boolean } from 'zod';

// Define the Location schema
// const locationSchema = new Schema<ILocation>({
//   type: {
//     type: String,
//     enum: ['Point'],
//     default: 'Point',
//   },
//   coordinates: {
//     type: [Number],
//     required: true,
//   },
// });

const ClientSchema = new Schema<IClient>(
  {
    authId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Auth',
    },
    name: {
      type: String,
      required: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone_number: {
      type: String,
      default: null,
    },
    profile_image: {
      type: String,
      default: null,
    },
    cover_image: {
      type: String,
      default: null,
    },
    email_notifications: {
      type: Boolean,
      default: false,
    },
    email_invoice: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

const Client: Model<IClient> = mongoose.model<IClient>('Client', ClientSchema);

export default Client;
