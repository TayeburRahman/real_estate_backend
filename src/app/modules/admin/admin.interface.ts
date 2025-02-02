/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import mongoose, { Document, Model } from 'mongoose';
 
export type IAdmin = Document & {
  authId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  profile_image?: string | null;
  phone_number: string;
  address?: string | null;
  location?: string | null;
  date_of_birth?: string | null;
}