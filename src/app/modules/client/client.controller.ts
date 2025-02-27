import catchAsync from "../../../shared/catchasync";
import sendResponse from "../../../shared/sendResponse";
import { IReqUser } from "../auth/auth.interface";
import { Request, RequestHandler, Response } from 'express';
import { ClientService } from "./client.service";
import { RequestData } from "../../../interfaces/common";

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await ClientService.updateMyProfile(req as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await ClientService.updateProfile(req as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

const getProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IReqUser;
  const result = await ClientService.getProfile(user);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
});

// ===============
const getAllClients = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await ClientService.getAllClients(query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Get successfully",
    data: result,
  });
});

const getClientAgent = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await ClientService.getClientAgent(query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Get successfully",
    data: result,
  });
});

// =client site====================================
const getUpcomingAppointment = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as any;
  const result = await ClientService.getUpcomingAppointment(query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Get successfully",
    data: result,
  });
});

const getRecentDeliverOrder = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as any;
  const result = await ClientService.getRecentDeliverOrder(query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Get successfully",
    data: result,
  });
});

const getClientOrder = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as any;
  const user = req.user as any;
  const result = await ClientService.getClientOrder(query, user);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Get successfully",
    data: result,
  });
});

const getAllClientsWithOrder = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await ClientService.getAllClientsWithOrder(query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Get successfully",
    data: result,
  });
});


export const ClientController = {
  getProfile,
  updateProfile,
  updateMyProfile,
  getAllClients,
  getClientAgent,
  getUpcomingAppointment,
  getRecentDeliverOrder,
  getClientOrder,
  getAllClientsWithOrder
};
