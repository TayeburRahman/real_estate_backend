import catchAsync from "../../../shared/catchasync";
import sendResponse from "../../../shared/sendResponse";
import { Request, Response } from 'express';
import ApiError from "../../../errors/ApiError";
import httpStatus from "http-status";
import { Types } from "mongoose";
import { TaskService } from "./task.service";
import { IReqUser } from "../auth/auth.interface";

const getAllTasks = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as any;
  const result = await TaskService.getAllTasks(query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Get all successfully",
    data: result,
  });
});

const assignTeamMember = catchAsync(async (req: Request, res: Response) => {
  const data = req.body as any;
  const result = await TaskService.assignTeamMember(data);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Assign Team Member Successfully",
    data: result,
  });
});

const takenTaskOfTeamMember = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IReqUser;
  const taskId = req.params.taskId as any;
  const result = await TaskService.takenTaskOfTeamMember(user, taskId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Taken task successfully",
    data: result,
  });
});

const getAllAssigned = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IReqUser;
  const result = await TaskService.getAllAssigned(user);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Taken task successfully",
    data: result,
  });
});

const completeTaskUpdateStatus = catchAsync(async (req: Request, res: Response) => {
  const user = req.params.taskId as string;
  const result = await TaskService.completeTaskUpdateStatus(user);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `${result} Task Successfully`,
    data: result,
  });
});

const rejectTask = catchAsync(async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string;
  const body = req.body;
  const user = req.user as IReqUser;
  const result = await TaskService.rejectTask(taskId, user, body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Task Reject Successfully`,
    data: result,
  });
});

const viewTaskDetails = catchAsync(async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string;
  const result = await TaskService.viewTaskDetails(taskId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Task Get Successfully`,
    data: result,
  });
});

const addSourceFileOfTask = catchAsync(async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string;
  const files = req.files as Express.Multer.File[];
  const result = await TaskService.addSourceFileOfTask(files, taskId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Files Add Successfully`,
    data: result,
  });
});

const addFinishFileOfTask = catchAsync(async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string;
  const files = req.files as Express.Multer.File[];
  const result = await TaskService.addFinishFileOfTask(files, taskId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Files Add Successfully`,
    data: result,
  });
});

const addCommentOfTaskFiles = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as { taskId: string, fileId: string, replayId: string };
  const body = req.body;
  const user = req.user as IReqUser;
  const result = await TaskService.addCommentOfTaskFiles(user, query, body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Add Comment Successfully`,
    data: result,
  });
});

const updateStatusTask = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as { status: string, taskId: string };
  const result = await TaskService.updateStatusTask(query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Status Update Successfully`,
    data: result,
  });
});

export const TaskController = {
  getAllTasks,
  assignTeamMember,
  takenTaskOfTeamMember,
  getAllAssigned,
  completeTaskUpdateStatus,
  rejectTask,
  viewTaskDetails,
  addSourceFileOfTask,
  addFinishFileOfTask,
  addCommentOfTaskFiles,
  updateStatusTask
};
