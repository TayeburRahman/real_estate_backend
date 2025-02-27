import { Request, RequestHandler, Response } from 'express';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchasync';
import { messageService } from './message.service';
import { IReqUser } from '../auth/auth.interface';

const sendMessage: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await messageService.sendMessage(req);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Message Send.`,
      data: result,
    });
  },
);

const getMessages: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await messageService.getMessages(req, res);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      data: result,
    });
  },
);

const conversationUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await messageService.conversationUser();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Conversation Retrieved Successfully',
      data: result,
    });
  },
);

const addOrRemoveFavoriteList: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const conversationId = req.query?.conversationId as string;
    const types = req.query?.types as string;
    const user = req.user as IReqUser;
    const result = await messageService.addOrRemoveFavoriteList(user, conversationId, types);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `${types === "add" ? "Add" : "Remove"} Favorite Successfully`,
      data: result,
    });
  },
);


const getFavoriteList: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as IReqUser;
    const result = await messageService.getFavoriteList(user);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'CGet Successfully',
      data: result,
    });
  },
);


export const messageController = {
  sendMessage,
  getMessages,
  conversationUser,
  addOrRemoveFavoriteList
};
