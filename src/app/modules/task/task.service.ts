import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import mongoose, { Types } from 'mongoose';
import { Comment, Orders, Tasks } from '../orders/order.model';
import { IReqUser } from '../auth/auth.interface';
import { ENUM_TASK_STATUS, ENUM_USER_ROLE } from '../../../enums/user';
import { IOrder, ITasks } from '../orders/order.interface';
import { ICommentData } from './task.interface';
import QueryBuilder from '../../../builder/QueryBuilder';
import Member from '../member/member.model';
import { IMember } from '../member/member.interface';
import { NotificationService } from '../notifications/notifications.service';


const assignTeamMember = async (payload: { memberId: Types.ObjectId[]; taskId: Types.ObjectId }) => {
  if (!payload.memberId.length || !payload.taskId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid request payload");
  }

  const task = await Tasks.findById(payload.taskId);
  if (!task) {
    throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
  }

  if (!Array.isArray(task.memberId)) {
    task.memberId = [];
  }

  const existingMembers = new Set(task.memberId.map(id => id.toString()));
  const newMembers = payload.memberId.filter(id => !existingMembers.has(id.toString()));

  if (newMembers.length) {
    task.memberId.push(...newMembers);
  }

  task.status = "In-Production";
  task.assigned = true;
  await task.save();

  return task;
};

const takenTaskOfTeamMember = async (user: IReqUser, taskId: Types.ObjectId) => {
  const { userId } = user as IReqUser;
  console.log("====")
  const task = await Tasks.findById(taskId);
  if (!task) {
    throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
  }
  if (!Array.isArray(task.memberId)) {
    task.memberId = [];
  }

  task.memberId.push(userId);
  task.assigned = true;
  task.status = "In-Production"
  await task.save();

  return task;
};

const getAllAssigned = async (user: IReqUser, page: number = 1, limit: number = 3) => {
  const { userId, role } = user as IReqUser;

  let matchFilter: any = { assigned: true };

  if (role === ENUM_USER_ROLE.MEMBER) {
    matchFilter.memberId = { $in: [new Types.ObjectId(userId)] };
  } else if (role !== ENUM_USER_ROLE.ADMIN && role !== ENUM_USER_ROLE.SUPER_ADMIN) {
    throw new ApiError(httpStatus.FORBIDDEN, "You are not authorized to perform this action");
  }

  page = Number(page);
  limit = Number(limit);
  const skip = (page - 1) * limit;

  console.log("==========", page, limit, skip)

  const totalCount = await Tasks.countDocuments(matchFilter);
  const totalPages = Math.ceil(totalCount / limit);

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
    { $unwind: { path: "$order", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "services",
        localField: "serviceId",
        foreignField: "_id",
        as: "service"
      }
    },
    { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "members",
        localField: "memberId",
        foreignField: "_id",
        as: "members"
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
        members: {
          $map: {
            input: "$members",
            as: "member",
            in: {
              _id: "$$member._id",
              name: "$$member.name",
              email: "$$member.email"
            }
          }
        },
        status: 1,
        createdAt: 1
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        tasks: { $push: "$$ROOT" }
      }
    },
    { $sort: { "_id": -1 } },

    { $skip: skip },
    { $limit: limit }
  ]);

  return {
    metadata: {
      total: totalCount,
      limit,
      page,
      totalPages
    },
    tasksByDate: result
  };
};

const completeTaskUpdateStatus = async (taskId: string) => {
  const task = await Tasks.findById(taskId);
  if (!task) {
    throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
  }
  // Notifications needed
  const TaskStatus = {
    PENDING: "In-Production",
    COMPLETE: "Delivered"
  }
  task.status = task.status === TaskStatus.COMPLETE ? TaskStatus.PENDING : TaskStatus.COMPLETE;
  await task.save();

  const orderId = task.orderId;
  const allTasksOfOrder = await Tasks.find({ orderId });

  const allCompleted = allTasksOfOrder.every((task) => task.status === ENUM_TASK_STATUS.DELIVERED);

  const order = await Orders.findById(orderId) as any;
  if (allCompleted) {
    order.status = 'Completed';
    // @ts-ignore;
    await order.save();

    await NotificationService.sendNotification({
      types: "client",
      orderId: order._id,
      user: order?.clientId,
      title: "Order Delivered",
      message: `Your order #${order._id} has been successfully Delivered. Thank you for choosing our service!`
    });
  }


  return task.status;
};

const getAllTasks = async (query: any, user: IReqUser) => {
  const { userId, role } = user;

  let matchConditions: any = {
    status: "Submitted",
  };


  if (role === ENUM_USER_ROLE.MEMBER) {
    const member = await Member.findById(userId).lean() as IMember;
    if (!member) throw new Error("Member not found");

    if (member.serviceId && member.serviceId.length > 0) {
      matchConditions.serviceId = { $in: member.serviceId.map(id => new Types.ObjectId(id)) };
    } else {
      return [];
    }
  }

  const tasks = await Tasks.aggregate([
    {
      $match: matchConditions
    },
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
      $project: {
        _id: 1,
        orderId: 1,
        "order.address": 1,
        serviceId: 1,
        "service.title": 1,
        memberId: 1,
        status: 1,
        createdAt: 1
      }
    },
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

const rejectTask = async (taskId: string, user: IReqUser, payload: any) => {
  const { memberId, reason } = payload || {};

  if (!memberId || !reason) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid request payload");
  }

  const task: any = await Tasks.findById(taskId) as ITasks;
  if (!task) {
    throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
  }


  task.memberId = task.memberId.filter((id: any) => id.toString() !== memberId.toString());
  if (task.memberId.length === 0) {

    task.assigned = false;
    task.status = "Submitted";
    console.log("===tasks", task);
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

const viewTaskDetailsClient = async (taskId: string) => {
  const task = await Tasks.findById(taskId).select("finishFile");
  if (!task) {
    throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
  }
  return task;
};

const getNewTasks = async (
  user: { userId: Types.ObjectId; authId: Types.ObjectId; role: string },
  query: { page?: number; limit?: number }
) => {
  const { userId, role } = user;
  const { page = 1, limit = 25 } = query;
  const skip = (page - 1) * limit;

  let matchQuery: any = {};

  if (role === ENUM_USER_ROLE.MEMBER) {
    matchQuery.schedule_memberId = { $in: [new Types.ObjectId(userId)] };
  }

  const taskQuery = await Tasks.aggregate([
    { $match: matchQuery },
    {
      $lookup: {
        from: "orders",
        localField: "orderId",
        foreignField: "_id",
        as: "order",
      },
    },
    {
      $lookup: {
        from: "services",
        localField: "serviceId",
        foreignField: "_id",
        as: "service",
      },
    },
    { $unwind: { path: "$order", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        orderId: 1,
        "order.address": 1,
        serviceId: 1,
        "service.title": 1,
        status: 1,
        createdAt: 1,
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        tasks: { $push: "$$ROOT" },
        totalTasks: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
    {
      $facet: {
        metadata: [{ $count: "total", }],
        data: [{ $skip: skip }, { $limit: limit }],
      },
    },
    {
      $addFields: {
        metadata: { $arrayElemAt: ["$metadata", 0] },
      },
    },
    {
      $addFields: {
        "metadata.limit": limit,
        "metadata.page": page,
      },
    }
  ]);

  const data = taskQuery?.length ? taskQuery[0] : taskQuery

  return data;
};

const taskStatusUpdateSubmitted = async (payload: { taskId: string; status: string }) => {
  const { taskId, status } = payload;

  if (!Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, "Invalid Task ID.");
  }

  if (status !== "Submitted" && status !== "Pending") {
    throw new ApiError(400, "Invalid status value, status must be 'Submitted' or 'Pending'.");
  }

  const updatedTask = await Tasks.findByIdAndUpdate(
    taskId,
    { status },
    { new: true }
  );

  if (!updatedTask) {
    throw new ApiError(404, "Task not found.");
  }

  return updatedTask;
};

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
  // const userType = user.role === ENUM_USER_ROLE.ADMIN ||
  //   user.role === ENUM_USER_ROLE.MEMBER ||
  //   user.role === ENUM_USER_ROLE.SUPER_ADMIN ? "Member" : "Client";
  const data: ICommentData = {
    taskId,
    fileId: fileId || null,
    replayId: replayId || null,
    comment: {
      text: payload.text,
      userId: user.authId,
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

const getCommentOfTaskFiles = async (query: { taskId: string, fileId?: string }) => {
  const { taskId, fileId } = query;

  if (!taskId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Task ID is required");
  }

  const filter: any = { taskId };
  if (fileId) {
    filter.fileId = fileId;
  }

  const result = await Comment.find(filter)
    .populate({
      path: "comment.userId",
      select: "name email profile_image"
    })
    .populate({
      path: "replayId",
      populate: {
        path: "comment.userId",
        select: "name email profile_image"
      }
    })
    .exec();

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

  const orderId = task.orderId;
  const allTasksOfOrder = await Tasks.find({ orderId });

  const allCompleted = allTasksOfOrder.every((task) => task.status === ENUM_TASK_STATUS.COMPLETED);

  const order = await Orders.findById(orderId) as any;
  console.log("====all====", allTasksOfOrder)
  if (allCompleted) {
    order.status = 'Completed';
    // @ts-ignore;
    await order.save();
    await NotificationService.sendNotification({
      types: "client",
      orderId: order._id,
      user: order?.clientId,
      title: "Order Completed",
      message: `Your order #${order._id} has been successfully completed. Thank you for choosing our service!`
    });
  }

  return task.status;
};

const deleteTaskFiles = async (types: string, fileId: string, taskId: string) => {

  if (!types || (types !== 'sourceFile' && types !== 'finishFile')) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid type. Must be 'sourceFile' or 'finishFile'");
  }

  const task = await Tasks.findById(taskId);
  if (!task) {
    throw new ApiError(httpStatus.NOT_FOUND, "Task not found");
  }

  if (!task[types] || !Array.isArray(task[types])) {
    throw new ApiError(httpStatus.BAD_REQUEST, `No files found in ${types}`);
  }

  const updatedFiles = task[types].filter((file: any) => file._id.toString() !== fileId);

  if (updatedFiles.length === task[types].length) {
    throw new ApiError(httpStatus.NOT_FOUND, "File not found");
  }

  task[types] = updatedFiles;
  await task.save();

  return { message: "File deleted successfully" };
};

const revisionsRequestTask = async (payload: { text: string }, query: { taskId: string, fileId: string }) => {
}
// =Dashboard Home Task=======================
const getStatusCounts = async () => {
  const statusCounts = await Tasks.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  const allStatuses = Object.values(ENUM_TASK_STATUS).reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {} as Record<string, number>);

  statusCounts.forEach(({ _id, count }) => {
    allStatuses[_id] = count;
  });

  return allStatuses;
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
  getCommentOfTaskFiles,
  deleteTaskFiles,
  revisionsRequestTask,
  getNewTasks,
  viewTaskDetailsClient,
  taskStatusUpdateSubmitted,
  getStatusCounts
};

