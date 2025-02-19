// import mongoose, { Schema, Model, Types } from 'mongoose';
 

// const packageSchema = new Schema<IPackage>(
//   {
//     services: {
//       type: [Types.ObjectId],
//       required: true,
//       ref: 'Service',
//     },
//     name: {
//       type: String,
//       required: true,
//     },
//     price: {
//       type: Number,
//       required: true,
//     },
//     descriptions: {
//       type: String,
//       default: null,
//     },
//     package_image: {
//       type: [String],
//       default: [],
//     }
//   }
// );

// const pricingGroupSchema = new Schema<IPricingGroup>(
//   {
//     clients: {
//       type: [Types.ObjectId],
//       required: true,
//       ref: 'Client',
//       default: [],
//     },
//     name: {
//       type: String,
//       required: true,
//     },
//     services: {
//       type: [{
//         serviceId: {
//           type: Types.ObjectId,
//           ref: 'Service',
//           required: true,
//         },
//         special_price: {
//           type: Number,
//           default: null,
//         },
//       }],
//       default: [],
//     }
//   }
// );

 
// const PricingGroup: Model<IPricingGroup> = mongoose.model<IPricingGroup>('PricingGroup', pricingGroupSchema);

// export { Service, ServiceCategory, Package, PricingGroup };
