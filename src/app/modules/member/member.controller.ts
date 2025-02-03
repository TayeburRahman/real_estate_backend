import catchAsync from "../../../shared/catchasync";
import sendResponse from "../../../shared/sendResponse";
import { IReqUser } from "../auth/auth.interface";
import { Request, RequestHandler, Response } from 'express';
import { MemberService } from "./member.service";
import { RequestData } from "../../../interfaces/common";

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await MemberService.updateProfile(req as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

const myProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IReqUser;
  const result = await MemberService.myProfile(user);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
});


export const MemberController = {
  myProfile,
  updateProfile,
};
