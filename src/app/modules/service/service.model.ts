import mongoose, { Schema, Model, Types } from 'mongoose';
import { IPackage, IPricingGroup, IService, IServiceCategory } from './service.interface';


const serviceCategorySchema = new Schema<IServiceCategory>(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
  },
);

const serviceSchema = new Schema<IService>(
  {
    category: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'ServiceCategory',
    },
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    descriptions: {
      type: String,
      default: null,
    },
    service_image: {
      type: [String],
      default: null,
    }
  }
);

const packageSchema = new Schema<IPackage>(
  {
    services: {
      type: [Types.ObjectId],
      required: true,
      ref: 'Service',
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    descriptions: {
      type: String,
      default: null,
    },
    package_image: {
      type: [String],
      default: [],
    }
  }
);

const pricingGroupSchema = new Schema<IPricingGroup>(
  {
    clients: {
      type: [Types.ObjectId],
      required: true,
      ref: 'Client',
      default: [],
    },
    name: {
      type: String,
      required: true,
    },
    services: {
      type: [{
        serviceId: {
          type: Types.ObjectId,
          ref: 'Service',
          required: true,
        },
        special_price: {
          type: Number,
          default: null,
        },
      }],
      default: [],
    }
  }
);



const Service: Model<IService> = mongoose.model<IService>('Service', serviceSchema);
const ServiceCategory: Model<IServiceCategory> = mongoose.model<IServiceCategory>('ServiceCategory', serviceCategorySchema);
const Package: Model<IPackage> = mongoose.model<IPackage>('Package', packageSchema);
const PricingGroup: Model<IPricingGroup> = mongoose.model<IPricingGroup>('PricingGroup', pricingGroupSchema);

export { Service, ServiceCategory, Package, PricingGroup };
