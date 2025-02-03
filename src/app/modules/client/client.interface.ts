import mongoose, { Document } from 'mongoose';

// export interface ILocation {
//   type: 'Point';
//   coordinates: number[];
// }

export interface IClient extends Document {
  authId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone_number?: string | null;
  date_of_birth?: string | null;
  profile_image?: string | null;
  cover_image: string | null;
  status?: 'pending' | 'approved' | 'declined';
  email_notifications: boolean;
  email_invoice: boolean;
  serviceId: mongoose.Types.ObjectId;
  // location?: ILocation;
}
