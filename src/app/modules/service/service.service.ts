import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { Package, PricingGroup, Service, ServiceCategory } from './service.model';
import { GetAllGetQuery, IPackage, IPricingGroup, IService } from './service.interface';
import { Types } from 'mongoose';
import QueryBuilder from '../../../builder/QueryBuilder';
import Client from '../client/client.model';

const createServiceCategory = async (payload: { name: string }) => {
  const { name } = payload;
  if (!name) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Name is required");
  }
  const result = await ServiceCategory.create({ name });
  return result;
};

const updateServiceCategory = async (id: string, payload: { name: string }) => {
  const { name } = payload;

  if (!name) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Name is required");
  }

  const result = await ServiceCategory.findByIdAndUpdate(
    id,
    { name },
    { new: true }
  );

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Service category not found");
  }

  return result;
};

const deleteServiceCategory = async (id: string) => {
  const result = await ServiceCategory.findByIdAndDelete(id);

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Service category not found");
  }

  return { message: "Service category deleted successfully" };
};

const getAllServiceCategories = async (searchTerm: string = '') => {
  const filter = searchTerm ? { name: { $regex: searchTerm, $options: 'i' } } : {};
  const result = await ServiceCategory.find(filter);
  return result;
};
// =================================
const createService = async (payload: IService, files: Express.Multer.File[]) => {
  const { category, title, price, descriptions } = payload;

  if (!category || !title || !price || !descriptions) {
    throw new ApiError(httpStatus.BAD_REQUEST, "All fields are required!");
  }

  if (!Types.ObjectId.isValid(category)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid category ID");
  }


  if (!files || files.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Please upload at least one service image!");
  }

  payload.service_image = files.map((file) => file.path);

  const result = await Service.create(payload);
  console.log(result);
  return result;
};

const updateService = async (
  serviceId: string,
  payload: any,
  files?: Express.Multer.File[]
) => {
  if (!Types.ObjectId.isValid(serviceId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid service ID");
  }

  const existingService = await Service.findById(serviceId);
  if (!existingService) {
    throw new ApiError(httpStatus.NOT_FOUND, "Service not found");
  }

  // if (payload.category && !Types.ObjectId.isValid(payload.category)) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, "Invalid category ID");
  // }

  if (Array.isArray(files) && files.length > 0) {
    const newData = files.map((file) => file.path);
    console.log("newData", newData)
    payload.service_image = [...(payload.service_image || []), ...newData];
  }

  const updatedService = await Service.findByIdAndUpdate(serviceId, payload, {
    new: true,
    runValidators: true,
  });


  if (!updatedService) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to update service");
  }

  return updatedService;
};

const deleteService = async (serviceId: string) => {

  if (!Types.ObjectId.isValid(serviceId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid service ID");
  }

  const existingService = await Service.findById(serviceId);
  if (!existingService) {
    throw new ApiError(httpStatus.NOT_FOUND, "Service not found");
  }

  const deletedService = await Service.findByIdAndDelete(serviceId);

  if (!deletedService) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to delete service");
  }

  return deletedService;
};

const getAllServices = async (query: GetAllGetQuery) => {
  const userQuery = new QueryBuilder(Service.find().populate("category"), query)
    .search(["title"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();

  return {
    meta,
    data: result,
  };
};
// =======================
const createPackages = async (payload: IPackage, files: Express.Multer.File[]) => {

  const { services, name, price, descriptions } = payload;
  console.log("fhdhgvjfdh", services)

  if (!services || !name || !price || !descriptions) {
    throw new ApiError(httpStatus.BAD_REQUEST, "All fields are required!");
  }


  if (!Array.isArray(services) || services.some(id => !Types.ObjectId.isValid(id))) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid service ID(s)");
  }


  if (!files || files.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Please upload at least one service image!");
  }

  payload.package_image = files.map((file) => file.path);

  const result = await Package.create(payload);
  return result;
};

const updatePackage = async (
  packageId: string,
  payload: Partial<IPackage>,
  files?: Express.Multer.File[]
) => {

  //@ts-ignore
  // payload.services = Array(payload.services);
  console.log("=========", payload)

  if (!Types.ObjectId.isValid(packageId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid package ID");
  }

  const existingPackage = await Package.findById(packageId);
  if (!existingPackage) {
    throw new ApiError(httpStatus.NOT_FOUND, "Package not found");
  }

  if (!Array.isArray(payload.services) || payload.services.some(id => !Types.ObjectId.isValid(id))) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid package ID(s)");
  }

  // if (files && files.length > 0) {
  //   payload.package_image = files.map((file) => file.path);
  // }

  if (Array.isArray(files) && files.length > 0) {
    const newData = files.map((file) => file.path);
    payload.package_image = [...(payload.package_image || []), ...newData];
  }

  const updatedPackage = await Package.findByIdAndUpdate(packageId, payload, {
    new: true,
    runValidators: true,
  });

  if (!updatedPackage) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to update package");
  }

  return updatedPackage;
};

const deletePackage = async (packageId: string) => {

  if (!Types.ObjectId.isValid(packageId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid package ID");
  }

  const existingPackage = await Package.findById(packageId);
  if (!existingPackage) {
    throw new ApiError(httpStatus.NOT_FOUND, "Package not found");
  }

  const deletedPackage = await Package.findByIdAndDelete(packageId);

  if (!deletedPackage) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to delete package");
  }

  return deletedPackage;
};

const getAllPackages = async (query: GetAllGetQuery) => {
  const userQuery = new QueryBuilder(Package.find().populate({ path: "services", select: "title _id" }), query)
    .search(["name"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();

  return {
    meta,
    data: result,
  };
};
// =============================== 
const createPricingGroup = async (payload: IPricingGroup) => {
  const { name, clients, services } = payload;
  if (!name || typeof name !== 'string') {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid name: Name is required and must be a string.");
  }

  if (!clients.every(client => Types.ObjectId.isValid(client))) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid clients: All client IDs must be valid ObjectIds.");
  }

  for (const service of services) {
    if (!service.serviceId || !Types.ObjectId.isValid(service.serviceId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid serviceId: Each service must have a valid ObjectId.");
    }
    if (service.special_price !== undefined && typeof service.special_price !== 'number') {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid special_price: Must be a number.");
    }
  }

  const newPricingGroup = new PricingGroup({
    name,
    clients,
    services,
  });

  const savedPricingGroup = await newPricingGroup.save();
  return savedPricingGroup;
};

const updatePricingGroup = async (id: string, payload: Partial<IPricingGroup>) => {

  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid ID: Pricing Group ID must be a valid ObjectId.");
  }

  const { name, clients, services } = payload;

  if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
    if (!Types.ObjectId.isValid(id)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid name: Must be a non-empty string.");
    }
  }

  if (clients !== undefined) {
    if (!Array.isArray(clients) || !clients.every(client => Types.ObjectId.isValid(client))) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid clients: All client IDs must be valid ObjectIds.");
    }
  }

  if (services !== undefined) {
    if (!Array.isArray(services)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid services: Must be an array.");
    }

    for (const service of services) {
      if (!service.serviceId || !Types.ObjectId.isValid(service.serviceId)) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid serviceId: Each service must have a valid ObjectId.");
      }
      console.log("service", service)
      if (service.special_price !== undefined && typeof service.special_price !== 'number') {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid special_price: Must be needed");
      }
    }
  }

  const updatedPricingGroup = await PricingGroup.findByIdAndUpdate(
    id,
    { $set: payload },
    { new: true, runValidators: true }
  );

  if (!updatedPricingGroup) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Pricing Group not found.");
  }

  console.log('✅ Pricing Group Updated:', updatedPricingGroup);
  return updatedPricingGroup;
};

const deletePriceGroups = async (groupId: string) => {

  if (!Types.ObjectId.isValid(groupId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Group ID");
  }

  const existingGroup = await PricingGroup.findById(groupId);
  if (!existingGroup) {
    throw new ApiError(httpStatus.NOT_FOUND, "Group not found");
  }

  const deletedGroup = await PricingGroup.findByIdAndDelete(groupId);

  if (!deletedGroup) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to delete group");
  }

  return deletedGroup;
};

const getAllGroupPrice = async (query: GetAllGetQuery) => {
  console.log("====", query);
  const userQuery = new QueryBuilder(PricingGroup.find()
    .populate({ path: "clients", select: "name profile_image" })
    .populate({ path: "services.serviceId", select: "title price _id" })
    , query)
    .search(["name"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();

  return {
    meta,
    data: result,
  };
};

const getAllGroupPriceDetails = async (groupId: string) => {

  if (!Types.ObjectId.isValid(groupId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Group ID");
  }

  const result = await PricingGroup.findById(groupId)
    .populate({ path: "clients", select: "name profile_image" })
    .populate({ path: "services.serviceId", select: "title price _id" })

  return result
};
// ======================================
const getAllClients = async (searchTerm: string) => {
  const filter: any = { role: 'CLIENT' };

  if (searchTerm) {
    filter.name = { $regex: searchTerm, $options: 'i' };
  }

  const result = await Client.find(filter)
    .select('name profile_image authId _id');

  return result;
};

const getAllServicesWithoutPagination = async (searchTerm: string) => {
  const filter = searchTerm ? { name: { $regex: searchTerm, $options: 'i' } } : {};

  const result = await Service.find(filter)
    .select('title _id price')

  return result
};
// ====================================
const getClientServices = async (searchTerm: string, clientId: string, categoryId: string) => {
  const filter = searchTerm ? { title: { $regex: searchTerm, $options: 'i' } } : {};

  if (categoryId) {
    // @ts-ignore
    filter.category = categoryId;
  }

  const services = await Service.find(filter).lean();

  const groups = await PricingGroup.find({ clients: clientId }).lean();

  const updatedServices = services.map(service => {
    const matchedGroup = groups.find(group =>
      group.services.some(s => s.serviceId.toString() === service._id.toString())
    );

    if (matchedGroup) {
      const specialService = matchedGroup.services.find(s => s.serviceId.toString() === service._id.toString());
      if (specialService && specialService.special_price !== null) {
        return { ...service, price: specialService.special_price };
      }
    }

    return service;
  });

  return updatedServices;
};

export const ServiceService = {
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  getAllServiceCategories,
  // ===================
  createService,
  updateService,
  deleteService,
  getAllServices,
  // ==================
  createPackages,
  updatePackage,
  deletePackage,
  getAllPackages,
  // ==================
  createPricingGroup,
  updatePricingGroup,
  deletePriceGroups,
  getAllGroupPrice,
  getAllGroupPriceDetails,
  getAllClients,
  getAllServicesWithoutPagination,
  // ====================
  getClientServices,
};

