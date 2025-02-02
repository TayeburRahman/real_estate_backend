import { Request, RequestHandler, Response } from 'express';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchasync';
import { NotificationService } from './notifications.service';
import { IReqUser } from '../auth/auth.interface';

//get notification only for admin
const getNotifications: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await NotificationService.getNotifications();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Notification retrieved successfully`,
      data: result,
    });
  },
);
//update notification only for admin
const updateNotification: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await NotificationService.updateNotification(req);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Notification updated successfully`,
      data: result,
    });
  },
);
const updateAll: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await NotificationService.updateAll();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Notification updated successfully`,
      data: result,
    });
  },
);
const myNotification: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await NotificationService.myNotification(
      req.user as IReqUser,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Notification retrieved successfully`,
      data: result,
    });
  },
);

const deleteNotifications: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await NotificationService.deleteNotifications(req);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Notification delete successfully`,
      data: result,
    });
  },
);

export const NotificationController = {
  getNotifications,
  updateNotification,
  myNotification,
  updateAll,
  deleteNotifications,
};
