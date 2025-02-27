import { Request } from 'express';
import Notification from './notifications.model';
import ApiError from '../../../errors/ApiError';
import { IReqUser } from '../auth/auth.interface';
import { SendNotificationParams } from './notifications.interface';
import Client from '../client/client.model';
import { sendMessageEmail } from '../../../mails/sendMessageEmail';
import { emailNotifications } from './emailNotifications';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { IClient } from '../client/client.interface';

const getAdminNotifications = async (user: IReqUser) => {
  const { userId, role } = user;
  let notifications;
  if (role === ENUM_USER_ROLE.MEMBER) {
    notifications = await Notification.find({ user: userId }).sort({
      createdAt: -1,
    });
  } else {
    notifications = await Notification.find({ isAdmin: true }).sort({
      createdAt: -1,
    });
  }
  return {
    notifications,
  };
};

const deleteNotifications = async (req: Request) => {
  const id = req.params.id;
  const allNotification = await Notification.deleteOne({ _id: id });
  return {
    allNotification,
  };
};

const updateNotification = async (req: Request) => {
  const id = req.params.id;

  const notification = await Notification.findById(id);
  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  const result = await Notification.findByIdAndUpdate(
    { _id: id },
    { $set: { status: true } },
    { new: true },
  ).sort({ createdAt: -1 });
  return result;
};

const seenNotifications = async (user: IReqUser) => {
  const { userId, role } = user;
  let result;
  if (role === ENUM_USER_ROLE.ADMIN || role === ENUM_USER_ROLE.SUPER_ADMIN) {
    result = await Notification.updateMany(
      { isAdmin: true },
      { $set: { status: true } },
      { new: true },
    ).sort({ createdAt: -1 });
  } else if (role === ENUM_USER_ROLE.AGENT) {
    const agent = await Client.findById(userId) as IClient;
    result = await Notification.updateMany(
      { user: agent.clientId },
      { $set: { status: true } },
      { new: true },
    ).sort({ createdAt: -1 });
  } else {
    result = await Notification.updateMany(
      { user: userId },
      { $set: { status: true } },
      { new: true },
    ).sort({ createdAt: -1 });
  }

  return result;
};

const clientNotification = async (query: any) => {
  if (!query?.clientId) {
    throw new ApiError(400, 'Missing Client ID');
  }
  return await Notification.find({ user: query.clientId }).sort({ createdAt: -1 });
};

const sendNotification = async ({ title, message, user, types, isAdmin, orderId }: SendNotificationParams): Promise<void> => {
  try {
    await Notification.create({
      title,
      message,
      user,
      types,
      isAdmin,
      orderId,
    });

    if (types === "client") {
      const client = await Client.findById(user)
      if (client?.email_notifications) {
        await sendMessageEmail(
          client.email as string,
          "Notification Message",
          emailNotifications({
            name: client.name,
            title,
            message
          })
        );
      }

    }
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

export const NotificationService = {
  getAdminNotifications,
  updateNotification,
  clientNotification,
  seenNotifications,
  deleteNotifications,
  sendNotification,
};
