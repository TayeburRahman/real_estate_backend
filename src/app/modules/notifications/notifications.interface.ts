import { Types } from 'mongoose'; 
import { IAuth } from '../auth/auth.interface';

export type INotification = {
  title: string;
  message: string;
  status: boolean;
  admin: boolean;
  // plan_id: Types.ObjectId | IUpgradePlan;
  user: Types.ObjectId | IAuth;
};
