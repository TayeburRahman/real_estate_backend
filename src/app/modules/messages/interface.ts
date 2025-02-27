import { Types } from 'mongoose';
import { IAuth } from '../auth/auth.interface';


export type IConversation = {
  orderId: Types.ObjectId;
  participants: Types.ObjectId[];
  isOrder: boolean;
  favorite: Types.ObjectId[];
  messages: Types.ObjectId[];
};
export type IMessage = {
  senderId: Types.ObjectId | IAuth;
  receiverId: Types.ObjectId | IAuth;
  conversationId: Types.ObjectId | IConversation;
  subject: string;
  message_img: string;
  message: string;
  externalModelType: string;
  isRevision: boolean;
  fileId: Types.ObjectId | null;
  taskId: Types.ObjectId | null;
};

export type Participant = {
  _id: string;
  name: string;
  email: string;
  role: string;
  type: 'User' | 'Driver';
};
