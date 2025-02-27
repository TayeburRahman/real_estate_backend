import mongoose, { Types } from 'mongoose';
import { IMessage } from './interface';

const messageSchema = new mongoose.Schema<IMessage>(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auth',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auth',
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
    },
    message_img: {
      type: String,
    },
    isRevision: {
      type: Boolean,
    },
    fileId: {
      type: Types.ObjectId,
    },
    taskId: {
      type: Types.ObjectId,
      // ref: "Task"
    },


  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

const Message = mongoose.model('Message', messageSchema);

export default Message;
