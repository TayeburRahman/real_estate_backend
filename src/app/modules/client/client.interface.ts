import mongoose, { Document } from 'mongoose';

// export interface ILocation {
//   type: 'Point';
//   coordinates: number[];
// } 

export interface ClientDocument extends Document {
  name: string;
  email: string;
  profile_image?: string;
  role: string;
}

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
  address: string | null;
  role: string | null;
  clientId: string | null;
  place_an_order: boolean;
  can_see_all_order: boolean;
  can_see_invoice: boolean;
  can_see_assigned_order: boolean;
  can_see_pricing: boolean;
  can_add_new_agent: boolean;
  // location?: ILocation;
}

