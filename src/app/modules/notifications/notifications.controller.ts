import { Request, RequestHandler, Response } from 'express';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchasync';
import { NotificationService } from './notifications.service';
import { IReqUser } from '../auth/auth.interface';

//get notification only for admin
const getAdminNotifications: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as IReqUser;
    const result = await NotificationService.getAdminNotifications(user);
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
const seenNotifications: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as IReqUser;
    const result = await NotificationService.seenNotifications(user);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Notification updated successfully`,
      data: result,
    });
  },
);
const clientNotification: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const query = req.query as any;
    const result = await NotificationService.clientNotification(query);
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
  getAdminNotifications,
  updateNotification,
  clientNotification,
  seenNotifications,
  deleteNotifications,
};
