import mongoose, { Document } from 'mongoose';

export interface ILocation {
  type: 'Point';
  coordinates: number[];
}

export interface IPartner extends Document {
  authId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  address?: string | null;
  phone_number?: string | null;
  date_of_birth?: string | null;
  isPhoneNumberVerified?: boolean;
  profile_image?: string | null;
  licensePlateImage?: string | null;
  drivingLicenseImage?: string | null;
  vehicleInsuranceImage?: string | null;
  vehicleRegistrationCardImage?: string | null;
  vehicleFrontImage?: string | null;
  vehicleBackImage?: string | null;
  vehicleSideImage?: string | null;
  bankAccountNumber?: string;
  bankName?: string;
  routingNumber?: string;
  accountHolderName?: string;
  paypalEmail?: string;
  rating?: number;
  status?: 'pending' | 'approved' | 'declined';
  current_trip_user?: mongoose.Types.ObjectId;
  location?: ILocation;
}
