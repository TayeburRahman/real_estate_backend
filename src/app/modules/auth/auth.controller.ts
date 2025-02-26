
import { Request, RequestHandler, Response } from 'express';
import catchAsync from '../../../shared/catchasync';
import { AuthService } from './auth.service';
import sendResponse from '../../../shared/sendResponse';
import config from '../../../config';
import { IReqUser } from './auth.interface';
import { GetAllGetQuery } from '../service/service.interface';

const registrationAccount = catchAsync(async (req: Request, res: Response) => {
  const { role } = await AuthService.registrationAccount(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Account register successfully!",
    data: role,
  });
});

const addClientAgents = catchAsync(async (req: Request, res: Response) => {
  const file = req.files
  const { role } = await AuthService.registrationUser(file, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Add account successfully!",
    data: role,
  });
});
// const activateAccount = catchAsync(async (req: Request, res: Response) => {
//   const result = await AuthService.activateAccount(req.body);
//   const { refreshToken } = result;

//   const cookieOptions = {
//     secure: config.env === "production",
//     httpOnly: true,
//   };
//   res.cookie("refreshToken", refreshToken, cookieOptions);
//   sendResponse(res, {
//     statusCode: 201,
//     success: true,
//     message: "Activation code verified successfully.",
//     data: result,
//   });
// });

const loginAccount = catchAsync(async (req: Request, res: Response) => {
  const loginData = req.body;
  const result = await AuthService.loginAccount(loginData);
  const { refreshToken } = result;

  const cookieOptions = {
    secure: config.env === "production",
    httpOnly: true,
  };
  res.cookie("refreshToken", refreshToken, cookieOptions);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Auth logged in successfully!",
    data: result,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const passwordData = req.body;
  const user = req.user as IReqUser;
  await AuthService.changePassword(user, passwordData);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Password changed successfully!",
  });
});

const forgotPass = catchAsync(async (req: Request, res: Response) => {
  await AuthService.forgotPass(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Check your email!",
  });
});

const checkIsValidForgetActivationCode = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.checkIsValidForgetActivationCode(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Code verified successfully",
    data: result,
  });
});

const resendCodeActivationAccount = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  const result = await AuthService.resendCodeActivationAccount(data);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Resent successfully",
    data: result,
  });
});

const resendCodeForgotAccount = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  const result = await AuthService.resendCodeForgotAccount(data);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Resent successfully",
    data: result,
  });
});

const resendActivationCode = catchAsync(async (req: Request, res: Response) => {
  // const data = req.body;
  // const result = await AuthService.resendActivationCode(data);
  // sendResponse(res, {
  //   statusCode: 200,
  //   success: true,
  //   message: "Resent successfully",
  //   data: result,
  // });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  await AuthService.resetPassword(req as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Password has been reset successfully.",
  });
});

const deleteMyAccount = catchAsync(async (req: Request, res: Response) => {
  await AuthService.deleteMyAccount(req.query as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Account delete successfully.",
  });
});

const getALLUsers = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as GetAllGetQuery;
  const searchTerm = query?.searchTerm as string;
  const result = await AuthService.getALLUsers(searchTerm);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Get successfully",
    data: result,
  });
});

export const AuthController = {
  registrationAccount,
  // activateAccount,
  loginAccount,
  changePassword,
  forgotPass,
  resetPassword,
  resendActivationCode,
  checkIsValidForgetActivationCode,
  resendCodeActivationAccount,
  resendCodeForgotAccount,
  deleteMyAccount,
  addClientAgents,
  getALLUsers
};
