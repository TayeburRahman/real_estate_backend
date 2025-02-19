import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import Auth from '../auth/auth.model';
import { RequestData } from '../../../interfaces/common';
import Client from './client.model';
import QueryBuilder from '../../../builder/QueryBuilder';
import { Types } from 'mongoose';
import { Orders } from '../orders/order.model';
import { IOrder } from '../orders/order.interface';
import { IMember } from '../member/member.interface';
import Member from '../member/member.model';


const updateMyProfile = async (req: RequestData) => {
  const { files, body: data } = req;
  const { authId, userId } = req.user;

  const checkValidClient = await Client.findById(userId);
  if (!checkValidClient) {
    throw new ApiError(404, "You are not authorized");
  }

  const fileUploads: Record<string, string> = {};
  if (files) {
    if (files.profile_image && files.profile_image[0]) {
      fileUploads.profile_image = `/images/profile/${files.profile_image[0].filename}`;
    }
    if (files.cover_image && files.cover_image[0]) {
      fileUploads.cover_image = `/images/profile/${files.cover_image[0].filename}`;
    }
  }

  const updatedUserData = { ...data, ...fileUploads };

  const [auth, result] = await Promise.all([
    Auth.findByIdAndUpdate(
      authId,
      { address: updatedUserData.address, phone_number: updatedUserData.phone_number, name: updatedUserData.name },
      {
        new: true,
      }
    ),
    Client.findByIdAndUpdate(userId, updatedUserData, {
      new: true,
      runValidators: true,
    }),
  ]);

  return { result, auth };
};

const updateProfile = async (req: RequestData) => {
  const { files, body: data } = req;
  const { authId, userId } = req.params as any

  const checkValidClient = await Client.findById(userId);
  if (!checkValidClient) {
    throw new ApiError(404, "You are not authorized");
  }

  const fileUploads: Record<string, string> = {};
  if (files) {
    if (files.profile_image && files.profile_image[0]) {
      fileUploads.profile_image = `/images/profile/${files.profile_image[0].filename}`;
    }
    if (files.cover_image && files.cover_image[0]) {
      fileUploads.cover_image = `/images/profile/${files.cover_image[0].filename}`;
    }
  }

  const updatedUserData = { ...data, ...fileUploads };

  const [auth, result] = await Promise.all([
    Auth.findByIdAndUpdate(
      authId,
      { address: updatedUserData.address, phone_number: updatedUserData.phone_number, name: updatedUserData.name },
      {
        new: true,
      }
    ),
    Client.findByIdAndUpdate(userId, updatedUserData, {
      new: true,
      runValidators: true,
    }),
  ]);

  return { result, auth };
};

const getProfile = async (user: { userId: Types.ObjectId }) => {
  const userId = user.userId;
  const result = await Client.findById(userId).populate("authId");
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const auth = await Auth.findById(result.authId);
  if (auth?.is_block) {
    throw new ApiError(httpStatus.FORBIDDEN, "You are blocked. Contact support");
  }

  return result;
};

const getAllClients = async (query: any) => {
  const userQuery = new QueryBuilder(Client.find({ role: "CLIENT" }), query)
    .search(["name", "email"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();

  return { meta, result };
};

const getClientAgent = async (query: any) => {
  if (!query.clientId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing Client ID");
  }
  const result = await Client.find({ role: "AGENT", clientId: query.clientId })

  return result;
};

// =Client site *Dashboard*** =========================
const getUpcomingAppointment = async (query: { clientId: string }) => {
  if (!query.clientId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing Client ID");
  }

  try {
    const currentDate = new Date();

    const orders: IOrder[] = await Orders.find({
      "clientId": query.clientId,
      "schedule.date": { $gte: currentDate }
    })
      .populate({
        path: 'schedule.memberId',
        select: 'name'
      })
      .select("schedule address taskIds")
      .sort({ "schedule.date": 1 });

    const upcomingAppointments = orders.map((order: any) => {
      const schedule = order.schedule;

      const membersAssigned = schedule.memberId && schedule.memberId.length > 0
        ? schedule.memberId.map((member: any) => member.name)
        : ["Unknown Agent"];

      const orderDate = schedule.date ? schedule.date.toLocaleDateString() : "N/A";
      const appointments = schedule.end_time ? `${schedule.end_time}` : "N/A";

      return {
        orderId: order._id,
        orderDate,
        address: `${order.address.streetName}, ${order.address.city}, ${order.address.state}, ${order.address.zipCode}`,
        member: membersAssigned,
        services: order.taskIds.length,
        appointments,
      };
    });

    return upcomingAppointments;
  } catch (error) {
    console.error(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to fetch upcoming appointments");
  }
};

const getRecentDeliverOrder = async (query: { clientId: string }) => {
  try {
    if (!query.clientId) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Missing Client ID");
    }
    const orders: IOrder[] = await Orders.find({
      "clientId": query.clientId,
      "status": { $in: ['Completed'] }
    })
      .populate({
        path: 'schedule.memberId',
        select: 'name'
      })
      .select("schedule address taskIds status paymentStatus updatedAt")
      .sort({ updatedAt: -1 });

    const recentDeliveredOrders = orders.map((order: any) => {
      const schedule = order.schedule;

      const membersAssigned = schedule.memberId && schedule.memberId.length > 0
        ? schedule.memberId.map((member: any) => member.name)
        : ["Unknown Agent"];

      const orderDate = schedule.date ? schedule.date.toLocaleDateString() : "N/A";
      const appointments = schedule.end_time ? `${schedule.end_time}` : "N/A";

      return {
        orderId: order._id,
        orderDate,
        address: `${order.address.streetName}, ${order.address.city}, ${order.address.state}, ${order.address.zipCode}`,
        member: membersAssigned,
        services: order.taskIds.length,
        total: order.totalAmount,
        appointments,
        status: order.status,
        paymentStatus: order.paymentStatus,
        updatedAt: order.updatedAt.toLocaleDateString(),
      };
    });

    return recentDeliveredOrders;
  } catch (error) {
    console.error(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to fetch recent delivered orders");
  }
};

// *Orders***==============================
const getClientOrder = async (query: { clientId: string, searchTerm?: string, filter?: string }) => {
  if (!query.clientId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing Client ID");
  }

  const searchCondition = query.searchTerm
    ? {
      $or: [
        { 'address.streetName': { $regex: query.searchTerm, $options: 'i' } },
        { 'address.streetAddress': { $regex: query.searchTerm, $options: 'i' } }
      ]
    }
    : {};

  let sortCondition = {};
  if (query.filter) {
    switch (query.filter) {
      case 'newest-first':
        sortCondition = { updatedAt: -1 };
        break;
      case 'oldest-first':
        sortCondition = { updatedAt: 1 };
        break;
      case 'appointment-newest-first':
        sortCondition = { 'schedule.date': -1 };
        break;
      case 'appointment-oldest-first':
        sortCondition = { 'schedule.date': 1 };
        break;
      default:
        sortCondition = { updatedAt: -1 };
    }
  }

  const orders = await Orders.find({
    "clientId": query.clientId,
    ...searchCondition,
  })
    .populate({
      path: 'schedule.memberId',
      select: 'name'
    })
    .populate({
      path: 'taskIds',
      select: 'status',
      populate: ({
        path: 'serviceId',
        select: 'title'
      })
    })
    .select("schedule address taskIds status paymentStatus updatedAt")
    .sort(sortCondition);

  const STATUS_LABELS = {
    PENDING: "Pending",
    SUBMITTED: "Submitted",
    IN_PRODUCTION: "In-Production",
    DELIVERED: "Delivered",
    REVISIONS: "Revisions",
    COMPLETED: "Completed"
  };

  const ordersWithStatus = orders.map((order: any) => {
    const statusCount = {
      [STATUS_LABELS.PENDING]: 0,
      [STATUS_LABELS.SUBMITTED]: 0,
      [STATUS_LABELS.IN_PRODUCTION]: 0,
      [STATUS_LABELS.DELIVERED]: 0,
      [STATUS_LABELS.REVISIONS]: 0,
      [STATUS_LABELS.COMPLETED]: 0,
    };

    order.taskIds.forEach((task: any) => {
      const taskStatus = task.status.trim();
      if (statusCount[taskStatus as keyof typeof STATUS_LABELS] !== undefined) {
        statusCount[taskStatus as keyof typeof STATUS_LABELS] += 1;
      }
    });

    return {
      _id: order._id,
      taskStatusCount: statusCount,
      schedule: order.schedule,
      address: order.address,
      status: order.status,
      paymentStatus: order.paymentStatus,
      updatedAt: order.updatedAt,
      taskIds: order.taskIds.map((task: any) => {
        return { name: task.serviceId.title };
      })
    };
  });

  return ordersWithStatus;
}




export const ClientService = {
  getProfile,
  updateProfile,
  getAllClients,
  updateMyProfile,
  getClientAgent,
  getUpcomingAppointment,
  getRecentDeliverOrder,
  getClientOrder
};

