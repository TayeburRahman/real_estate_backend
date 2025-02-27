import { Types } from 'mongoose';
import { IAuth } from '../auth/auth.interface';

export type INotification = {
  title: string;
  message: string;
  status: boolean;
  isAdmin: boolean;
  types: string
  orderId: string;
  // plan_id: Types.ObjectId | IUpgradePlan;
  user: Types.ObjectId | IAuth;
};

export interface SendNotificationParams {
  title: string;
  message: string;
  user: any;
  types: string;
  isAdmin?: boolean;
  orderId?: any;
  serviceId?: string;
}
