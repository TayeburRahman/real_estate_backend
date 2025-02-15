import mongoose, { Document, Types } from 'mongoose';

export interface IServiceCategory {
  name: string; 
}

export interface IService {
  category: Types.ObjectId;
  title: string; 
  price: number;
  descriptions: string;
  service_image: string[];
}

export interface IPackage {
  services: Types.ObjectId[];
  name: string; 
  price: number;
  descriptions: string;
  package_image: string[];
  existingImages: string[]
}

export interface IPricingGroup {
  clients: Types.ObjectId[];
  name: string;
  services: {
    serviceId: Types.ObjectId;
    special_price?: number;
  }[];
}

export interface GetAllGetQuery extends Record<string, unknown> {
  searchTerm?: string;
  category?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
  fields?: string;
}


 
 
// export interface IClient extends Document {
//   authId: mongoose.Types.ObjectId;
//   name: string;
  
// }
