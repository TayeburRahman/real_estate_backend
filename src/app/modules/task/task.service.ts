import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import mongoose, { Types } from 'mongoose';
import { Comment, Orders, Tasks } from '../orders/order.model';
import { IReqUser } from '../auth/auth.interface';
import { ENUM_TASK_STATUS, ENUM_USER_ROLE } from '../../../enums/user';
import { ITasks } from '../orders/order.interface';
import { ICommentData } from './task.interface';

const getAllTasks = async (query: any) => {
  const tasks = await Tasks.aggregate([
    {
      $match: {
        $or: [{ memberId: null }, { memberId: { $exists: false } }]
      }
    },
    // Populate orderId (Only select address)
    {
      $lookup: {
        from: "orders",
        localField: "orderId",
        foreignField: "_id",
        as: "order"
      }
    },
    {
      $unwind: {
        path: "$order",
        preserveNullAndEmptyArrays: true
      }
    },
    // Populate serviceId (Only select title)
    {
      $lookup: {
        from: "services",
        localField: "serviceId",
        foreignField: "_id",
        as: "service"
      }
    },
    {
      $unwind: {
        path: "$service",
        preserveNullAndEmptyArrays: true
      }
    },
    // Select specific fields
    {
      $project: {
        _id: 1,
        orderId: 1,
        "order.address": 1,
        serviceId: 1,
        "service.title": 1,
        memberId: 1,
        createdAt: 1
      }
    },
    // Group by date
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        tasks: { $push: "$$ROOT" }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return tasks;
};

const assignTeamMember = async (payload: { memberId: Types.ObjectId; taskId: Types.ObjectId }) => {
  if (!payload.memberId || !payload.taskId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid request payload");
  }
  // Notifications needed
  const task = await Tasks.findById(payload.taskId);
  if (!task) {
    throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
  }

  if (!Array.isArray(task.memberId)) {
    task.memberId = [];
  }

  task.memberId.push(payload.memberId);
  task.assigned = true;
  await task.save();

  return task;
};

const takenTaskOfTeamMember = async (user: IReqUser, taskId: Types.ObjectId) => {
  const { userId } = user as IReqUser;
  const task = await Tasks.findById(taskId);
  if (!task) {
    throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
  }
  if (!Array.isArray(task.memberId)) {
    task.memberId = [];
  }

  task.memberId.push(userId);
  task.assigned = true;
  await task.save();

  return task;
};

const getAllAssigned = async (user: IReqUser) => {
  const { userId, role } = user as IReqUser;

  let matchFilter: any = { assigned: true };

  if (role === ENUM_USER_ROLE.MEMBER) {
    matchFilter.memberId = { $in: [new mongoose.Types.ObjectId(userId)] };
  } else if (role !== ENUM_USER_ROLE.ADMIN && role !== ENUM_USER_ROLE.SUPER_ADMIN) {
    throw new ApiError(httpStatus.FORBIDDEN, "You are not authorized to perform this action");
  }

  const result = await Tasks.aggregate([
    { $match: matchFilter },
    {
      $lookup: {
        from: "orders",
        localField: "orderId",
        foreignField: "_id",
        as: "order"
      }
    },
    {
      $unwind: {
        path: "$order",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: "services",
        localField: "serviceId",
        foreignField: "_id",
        as: "service"
      }
    },
    {
      $unwind: {
        path: "$service",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $addFields: {
        createdAt: { $ifNull: ["$createdAt", new Date()] }
      }
    },
    {
      $project: {
        _id: 1,
        orderId: 1,
        "order.address": 1,
        serviceId: 1,
        "service.title": 1,
        memberId: 1,
        createdAt: 1
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        tasks: { $push: "$$ROOT" }
      }
    },
    {
      $sort: { "_id": 1 }
    }
  ]);

  return result;
};

const completeTaskUpdateStatus = async (taskId: string) => {
  const task = await Tasks.findById(taskId);
  if (!task) {
    throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
  }
  // Notifications needed
  const TaskStatus = {
    PENDING: "Pending",
    COMPLETE: "Completed"
  }
  task.status = task.status === TaskStatus.COMPLETE ? TaskStatus.PENDING : TaskStatus.COMPLETE;
  await task.save();
  return task.status;
};

const rejectTask = async (taskId: string, user: IReqUser, payload: any) => {
  const { memberId, reason } = payload || {};
  // Notifications needed
  if (!memberId || !reason) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid request payload");
  }

  const task = await Tasks.findById(taskId);
  if (!task) {
    throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
  }

  if (Array.isArray(task.memberId)) {
    task.memberId = task.memberId.filter((id) => id.toString() !== memberId);
  }

  if (!task.memberId?.length) {
    task.assigned = false;
  }

  await task.save();
  return task;
};

const viewTaskDetails = async (taskId: string) => {
  const task = await Tasks.findById(taskId).select("sourceFile finishFile orderId serviceId assigned");
  if (!task) {
    throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
  }
  return task;
}
// ===============
const addSourceFileOfTask = async (files: Express.Multer.File[], taskId: string) => {
  if (!files || files.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No files uploaded");
  }

  const task = await Tasks.findById(taskId);
  if (!task) {
    throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
  }

  if (!Array.isArray(task.sourceFile)) {
    task.sourceFile = [];
  }

  const filePaths = files.map((file) => ({ url: file.path }));
  task.sourceFile.push(...filePaths);

  await task.save();
  return task;
};

const addFinishFileOfTask = async (files: Express.Multer.File[], taskId: string) => {
  if (!files || files.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No files uploaded");
  }
  const task = await Tasks.findById(taskId);
  if (!task) {
    throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
  }
  if (!Array.isArray(task.finishFile)) {
    task.finishFile = [];
  }
  const filePaths = files.map((file) => ({ url: file.path, status: "Completed" }));
  task.finishFile.push(...filePaths);
  await task.save();
  return task;
};

const addCommentOfTaskFiles = async (
  user: IReqUser,
  query: { taskId: string, fileId: string, replayId: string },
  payload: { text: string }) => {
  const { taskId, fileId, replayId } = query;
  if (!taskId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Task ID is required");
  }
  const task = await Tasks.findById(taskId);
  if (!task) {
    throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
  }
  const userType = user.role === ENUM_USER_ROLE.ADMIN ||
    user.role === ENUM_USER_ROLE.MEMBER ||
    user.role === ENUM_USER_ROLE.SUPER_ADMIN ? "Member" : "Client";
  const data: ICommentData = {
    taskId,
    fileId: fileId || null,
    replayId: replayId || null,
    comment: {
      text: payload.text,
      userId: user.userId,
      userType: userType,
    },
  };

  if (!data.replayId) {
    delete data.replayId;
  }
  if (!data.fileId) {
    delete data.fileId;
  }
  const result = await Comment.create(data)
  return result;
};

const updateStatusTask = async (query: { status: string; taskId: string }) => {
  const task = await Tasks.findById(query.taskId);
  if (!task) {
    throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
  }

  if (!Object.values(ENUM_TASK_STATUS).includes(query.status as ENUM_TASK_STATUS)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid task status");
  }

  task.status = query.status as ENUM_TASK_STATUS;
  await task.save();

  return task.status;
};


export const TaskService = {
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

};

