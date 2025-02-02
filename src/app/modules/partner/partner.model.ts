import mongoose, { Schema, Model } from 'mongoose'; 
import { ILocation, IPartner } from './patner.interface';
// Define the Location schema
const locationSchema = new Schema<ILocation>({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
  },
  coordinates: {
    type: [Number],
    required: true,
  },
});

// Define the Partner schema
const PartnerSchema = new Schema<IPartner>(
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
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      default: null,
    },
    phone_number: {
      type: String,
      default: null,
    },
    date_of_birth: {
      type: String,
      default: null,
    },
    isPhoneNumberVerified: {
      type: Boolean,
      default: false,
    },
    profile_image: {
      type: String,
      default: null,
    },
    licensePlateImage: {
      type: String,
      default: null,
    },
    drivingLicenseImage: {
      type: String,
      default: null,
    },
    vehicleInsuranceImage: {
      type: String,
      default: null,
    },
    vehicleRegistrationCardImage: {
      type: String,
      default: null,
    },
    vehicleFrontImage: {
      type: String,
      default: null,
    },
    vehicleBackImage: {
      type: String,
      default: null,
    },
    vehicleSideImage: {
      type: String,
      default: null,
    },
    bankAccountNumber: {
      type: String,
    },
    bankName: {
      type: String,
    },
    routingNumber: {
      type: String,
    },
    accountHolderName: {
      type: String,
    },
    paypalEmail: {
      type: String,
    },
    rating: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'declined'],
      default: 'pending',
    },
    current_trip_user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    location: {
      type: locationSchema,
    },
  },
  {
    timestamps: true,
  }
);

// Create the Partner model
const Partner: Model<IPartner> = mongoose.model<IPartner>('Partner', PartnerSchema);

export default Partner;
