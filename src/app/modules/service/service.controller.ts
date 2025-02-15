import catchAsync from "../../../shared/catchasync";
import sendResponse from "../../../shared/sendResponse";
import { Request, Response } from 'express';
import { ServiceService } from "./service.service";
import { GetAllGetQuery, IPackage, IPricingGroup, IService, IServiceCategory } from "./service.interface";
import ApiError from "../../../errors/ApiError";
import httpStatus from "http-status";
import { Types } from "mongoose";

const createServiceCategory = catchAsync(async (req: Request, res: Response) => {
  const body = req.body as IServiceCategory;
  const result = await ServiceService.createServiceCategory(body as IServiceCategory);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Create successfully",
    data: result,
  });
});
const updateServiceCategory = catchAsync(async (req: Request, res: Response) => {
  const body = req.body as any;
  const id = req.params.id;
  const result = await ServiceService.updateServiceCategory(id, body as IServiceCategory);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Service category updated successfully",
    data: result,
  });
});
const deleteServiceCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await ServiceService.deleteServiceCategory(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Service category deleted successfully",
  });
});
const getAllServiceCategories = catchAsync(async (req: Request, res: Response) => {
  const searchTerm = req.query.searchTerm ? String(req.query.searchTerm) : '';
  const result = await ServiceService.getAllServiceCategories(searchTerm);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Service categories retrieved successfully",
    data: result,
  });
});
// ===========================
const createService = catchAsync(async (req: Request, res: Response) => {
  const body = req.body as IService;
  const result = await ServiceService.createService(body as IService, req.files as Express.Multer.File[]);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Create successfully",
    data: result,
  });
});
const updateService = catchAsync(async (req: Request, res: Response) => {
  const serviceId = req.params.id;
  let body = req.body as any;
  const files = req.files as Express.Multer.File[];

  if (typeof body.data === "string") {
    try {
      body = JSON.parse(body.data);
    } catch (error) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid JSON format in payload.data");
    }
  }

  const result = await ServiceService.updateService(serviceId, body, files);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Service updated successfully",
    data: result,
  });
});
const deleteService = catchAsync(async (req: Request, res: Response) => {
  const serviceId = req.params.id;

  const result = await ServiceService.deleteService(serviceId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Service deleted successfully",
    data: result,
  });
});
const getAllServices = catchAsync(async (req: Request, res: Response) => {

  const result = await ServiceService.getAllServices(req.query as GetAllGetQuery);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Services fetched successfully",
    data: result,
  });
});
// =============================
const createPackages = catchAsync(async (req: Request, res: Response) => {
  const body = req.body as IPackage;
  const result = await ServiceService.createPackages(body as IPackage, req.files as Express.Multer.File[]);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Create successfully",
    data: result,
  });
});
const updatePackages = catchAsync(async (req: Request, res: Response) => {
  const packageId = req.params.id;
  let body = req.body as any;
  const files = req.files as Express.Multer.File[];
  if (typeof body.data === "string") {
    try {
      body = JSON.parse(body.data);
    } catch (error) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid JSON format in payload.data");
    }
  }

  const result = await ServiceService.updatePackage(packageId, body, files);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Packages updated successfully",
    data: result,
  });
});
const deletePackages = catchAsync(async (req: Request, res: Response) => {
  const packageId = req.params.id;

  const result = await ServiceService.deletePackage(packageId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Package deleted successfully",
    data: result,
  });
});
const getAllPackages = catchAsync(async (req: Request, res: Response) => {

  const result = await ServiceService.getAllPackages(req.query as GetAllGetQuery);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Package fetched successfully",
    data: result,
  });
});

// =================================
const createPricingGroup = catchAsync(async (req: Request, res: Response) => {
  const body = req.body as IPricingGroup;
  const result = await ServiceService.createPricingGroup(body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Pricing Group created successfully',
    data: result,
  });
});
const updatePricingGroup = catchAsync(async (req: Request, res: Response) => {
  const body = req.body as IPricingGroup;
  const id = req.params.id;
  const result = await ServiceService.updatePricingGroup(id, body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Pricing Group update successfully',
    data: result,
  });
});
const deletePriceGroups = catchAsync(async (req: Request, res: Response) => {
  const groupId = req.params.id;

  const result = await ServiceService.deletePriceGroups(groupId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Pricing group deleted successfully",
    data: result,
  });
});
const getAllGroupPrice = catchAsync(async (req: Request, res: Response) => {

  const result = await ServiceService.getAllGroupPrice(req.query as GetAllGetQuery);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Price group get successfully",
    data: result,
  });
});
const getAllGroupPriceDetails = catchAsync(async (req: Request, res: Response) => {
  const groupId = req.params.id

  const result = await ServiceService.getAllGroupPriceDetails(groupId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Price group details get successfully",
    data: result,
  });
});
const getAllClients = catchAsync(async (req: Request, res: Response) => {
  const searchTerm = req.query.searchTerm ? String(req.query.searchTerm) : '';

  const result = await ServiceService.getAllClients(searchTerm);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "get client successfully",
    data: result,
  });
});
const getAllServicesWithoutPagination = catchAsync(async (req: Request, res: Response) => {
  const searchTerm = req.query.searchTerm ? String(req.query.searchTerm) : '';

  const result = await ServiceService.getAllServicesWithoutPagination(searchTerm);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "get client successfully",
    data: result,
  });
});
// =======================
const getClientServices = catchAsync(async (req: Request, res: Response) => {
  const searchTerm = req.query.searchTerm ? String(req.query.searchTerm) : '';
  const categoryId = req.query.categoryId ? String(req.query.categoryId) : '';
  const clientId = req.params.clientId as string;

  const result = await ServiceService.getClientServices(searchTerm, clientId, categoryId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Get services successfully",
    data: result,
  });
});




export const ServiceController = {
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  getAllServiceCategories,
  // ====================
  createService,
  updateService,
  deleteService,
  getAllServices,
  // ===================
  createPackages,
  updatePackages,
  deletePackages,
  getAllPackages,
  // =================
  createPricingGroup,
  updatePricingGroup,
  deletePriceGroups,
  getAllGroupPrice,
  getAllGroupPriceDetails,
  getAllClients,
  getAllServicesWithoutPagination,
  getClientServices

};
