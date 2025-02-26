import catchAsync from "../../../shared/catchasync";
import sendResponse from "../../../shared/sendResponse";
import { Request, Response } from 'express';
import { TaskService } from "./task.service";
import { IReqUser } from "../auth/auth.interface";
import { GetAllOrderQuery } from "../orders/order.interface";

const getAllTasks = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as any;
  const user = req.user as IReqUser;
  const result = await TaskService.getAllTasks(query, user);
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
  const user = req?.user as IReqUser;
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
  const { page, limit } = req.query as GetAllOrderQuery;
  const result = await TaskService.getAllAssigned(user, page as any, limit as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Taken task successfully",
    data: result,
  });
});

const getNewTasks = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IReqUser;
  const query = req.query as any;
  const result = await TaskService.getNewTasks(user, query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Get completed task successfully",
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

const viewTaskDetailsClient = catchAsync(async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string;
  const result = await TaskService.viewTaskDetailsClient(taskId);
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

const getCommentOfTaskFiles = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as { taskId: string, fileId: string, replayId: string };
  const result = await TaskService.getCommentOfTaskFiles(query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Get Successfully`,
    data: result,
  });
});

const deleteTaskFiles = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as { types: string, fileId: string };
  const taskId = req.params.taskId as string;
  const result = await TaskService.deleteTaskFiles(query.types, query.fileId, taskId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Get Successfully`,
    data: result,
  });
});

const revisionsRequestTask = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as { taskId: string, fileId: string };
  const body = req.body as {
    text: string
  }
  const result = await TaskService.revisionsRequestTask(body, query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Revisions Request Successfully`,
    data: result,
  });
});

const taskStatusUpdateSubmitted = catchAsync(async (req: Request, res: Response) => {
  const body = req.body as {
    status: string,
    taskId: string,
    fileId: string,
  }
  const result = await TaskService.taskStatusUpdateSubmitted(body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Revisions Request Successfully`,
    data: result,
  });
});
// Home Dashboard=================================
const getStatusCounts = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IReqUser;
  const result = await TaskService.getStatusCounts();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Get Status Counts Successfully",
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
  updateStatusTask,
  getCommentOfTaskFiles,
  deleteTaskFiles,
  revisionsRequestTask,
  viewTaskDetailsClient,
  getNewTasks,
  taskStatusUpdateSubmitted,
  getStatusCounts
};
