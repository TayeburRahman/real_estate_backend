import mongoose, { Document, Model } from "mongoose";

interface IAdmin extends Document {
  authId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  profile_image?: string | null;
  phone_number: string;
  address?: string | null;
  location?: string | null;
  date_of_birth?: string | null;
}

const AdminSchema = new mongoose.Schema<IAdmin>(
  {
    authId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Auth",
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    profile_image: {
      type: String,
      default: null,
    },
    phone_number: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      default: null,
    },
    location: {
      type: String,
      default: null,
    },
    date_of_birth: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Statics
const Admin: Model<IAdmin> = mongoose.model<IAdmin>("Admin", AdminSchema);

export default Admin;
