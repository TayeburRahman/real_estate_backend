
import { Types } from 'mongoose';
import { ENUM_USER_ROLE } from '../../../enums/user';

export interface IServiceCategory {
  name: string;
}

export interface ICommentData {
  taskId: string;
  fileId?: string | null;
  replayId?: string | null;
  comment: {
    text: string;
    userId: Types.ObjectId;
    userType: ENUM_USER_ROLE;
  };
}
