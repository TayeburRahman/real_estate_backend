import mongoose, { Schema, Model } from 'mongoose';
import { IMember } from './member.interface';

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

const MemberSchema = new Schema<IMember>(
  {
    authId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Auth',
    },
    role: {
      type: String,
      enum: ["MEMBER", "ADMIN", "SUPER_ADMIN"],
      required: true,
    },
    roleOfName: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    serviceId: {
      type: [Schema.Types.ObjectId],
      ref: 'Service',
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
    view_assigned_order: {
      type: Boolean,
      default: false,
    },
    view_all_order: {
      type: Boolean,
      default: false,
    },
    place_on_order_for_client: {
      type: Boolean,
      default: false,
    },
    // do_production_work: {
    //   type: Boolean,
    //   default: false,
    // },
    see_the_pricing: {
      type: Boolean,
      default: false,
    },
    is_admin: {
      type: Boolean,
      default: false,
    },
    edit_order: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

const Member: Model<IMember> = mongoose.model<IMember>('Member', MemberSchema);

export default Member;
