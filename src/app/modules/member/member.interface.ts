import mongoose, { Document } from 'mongoose';

export interface ILocation {
  type: 'Point';
  coordinates: number[];
}

export interface IMember extends Document {
  authId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  address?: string | null;
  phone_number?: string | null;
  profile_image?: string | null;
  cover_image: string | null;
  serviceId: mongoose.Types.ObjectId[];
  view_assigned_order: boolean | null;
  view_all_order: boolean | null;
  place_on_order_for_client: boolean | null;
  do_production_work: boolean | null;
  see_the_pricing: boolean | null;
  edit_order: boolean | null;
  status?: 'pending' | 'approved' | 'declined';
  role: string | null;
  roleOfName: string | null;
  is_admin?: boolean | null;
}

