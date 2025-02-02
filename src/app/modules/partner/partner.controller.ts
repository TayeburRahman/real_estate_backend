import catchAsync from "../../../shared/catchasync";
import sendResponse from "../../../shared/sendResponse";
import { IReqUser } from "../auth/auth.interface"; 
import { Request, RequestHandler, Response } from 'express'; 
import { PartnerService } from "./partner.service";
import { RequestData } from "../../../interfaces/common";

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await PartnerService.updateProfile(req as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

const getProfile = catchAsync(async (req: Request, res: Response) => {
 const user =  req.user as IReqUser;
  const result = await PartnerService.getProfile(user);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
});

const deleteMyAccount = catchAsync(async (req: Request, res: Response) => {
  await PartnerService.deleteMyAccount(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Account deleted!",
  });
});

export const PartnerController = {
  deleteMyAccount,
  getProfile,
  updateProfile,
};
 