/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */ 
import { Document, Model } from 'mongoose';
export type IEmailOptions = {
  email: string;
  subject: string;
  // template: string;
  // data?: { [key: string]: any };
  html: any;
};
export type IRegistration = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  avatar?: string;
  phone_number?: string;
  role?: string;
};
export type IActivationToken = {
  //i will do it , but what? its hello world.
  token: string;
  activationCode: string;
};
export type IActivationRequest = {
  userEmail: string;
  activation_code: string;
};
export type IReqUser = {
  userId: string;
  authId: string;
  role: string;
};

export type Ireting = {
  userId: string;
};

export type IAuth = Document & {
  name: string;
  email: string;
  password: string;
  role: 'USER' | 'PARTNER' | 'ADMIN' | 'SUPER_ADMIN';
  verifyCode?: string;
  codeVerify?: boolean;
  activationCode?: string;
  verifyExpire?: Date;
  expirationTime?: Date;
  is_block?: boolean;
  isActive?: boolean;
  confirmPassword: string;
  [key: string]: any; 
};

export interface IAuthModel extends Model<IAuth> {
  isAuthExist(email: string): Promise<IAuth | null>;
  isPasswordMatched(givenPassword: string, savedPassword: string): Promise<boolean>;
}

export interface ActivationPayload {
  activation_code: string;
  userEmail: string;
}


export interface LoginPayload {
  email: string;
  password: string;
}