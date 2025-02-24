import { Types } from "mongoose";
import { ENUM_SOCKET_EVENT } from "../../../enums/user";
import ApiError from "../../../errors/ApiError";
import Conversation from "./conversation.model";
import Message from "./message.model";
import { Comment, Tasks } from "../orders/order.model";
import { ITasks } from "../orders/order.interface";
import { ICommentData } from "../task/task.interface";


const handleMessageData = async (
    senderId: any,
    socket: any,
    onlineUsers: any,
): Promise<void> => {

    socket.on(ENUM_SOCKET_EVENT.MESSAGE_GETALL_ORDER, async (data: {
        orderid: string,
        page: number,
    }) => {
        const { orderId, page } = data as any;

        if (!senderId) {
            socket.emit('error', {
                message: 'SenderId not found!',
            });
            return;
        }
        const conversation = await Conversation.findOne({
            orderId
        }).populate({
            path: 'messages',
            populate: {
                path: 'senderId',
                select: 'name email profile_image',
            },
            options: {
                sort: { createdAt: -1 },
                skip: (page - 1) * 20,
                limit: 20,
            },
        });

        if (!conversation) {
            return 'Conversation not found';
        }

        if (conversation) {
            await emitMessage(senderId, conversation, ENUM_SOCKET_EVENT.MESSAGE_GETALL_ORDER)
        }
    },
    );


    socket.on(ENUM_SOCKET_EVENT.MESSAGE_NEW, async (data: { receiverId: string; text: string }) => {
        const { receiverId, text } = data;

        if (!senderId || !text) {
            socket.emit("error", { message: "SenderId or text is missing!" });
            return;
        }

        if (!receiverId) {
            throw new ApiError(404, "Receiver user not found");
        }

        let conversation = await Conversation.findOne({
            participants: { $all: [receiverId, senderId] },
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [receiverId, senderId],
            });
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            conversationId: conversation._id,
        });

        conversation.messages.push(newMessage._id);
        await Promise.all([conversation.save(), newMessage.save()]);

        // Emit message to both users
        emitMessage(senderId, newMessage, `${ENUM_SOCKET_EVENT.MESSAGE_NEW}/${receiverId}`);
        emitMessage(receiverId, newMessage, `${ENUM_SOCKET_EVENT.MESSAGE_NEW}/${senderId}`);
    });

    // Handle new messages related to orders
    socket.on(ENUM_SOCKET_EVENT.MESSAGE_NEW_ORDER, async (data: { orderId: string; text: string }) => {
        const { orderId, text } = data;
        try {
            if (!text || !orderId) {
                socket.emit("error", { message: "Order ID or text is missing!" });
                return;
            }

            let conversation = await Conversation.findOne({ orderId });

            if (!conversation) {
                conversation = await Conversation.create({
                    orderId,
                    participants: [senderId],
                });
            } else if (!conversation.participants.includes(senderId)) {
                conversation.participants.push(senderId);
            }

            const newMessage = new Message({
                senderId,
                message: text,
                conversationId: conversation._id,
            });

            conversation.messages.push(newMessage._id);
            await Promise.all([conversation.save(), newMessage.save()]);

            // Populate the senderId in the message
            const populatedMessage = await Message.findById(newMessage._id).populate({
                path: 'senderId',
                select: 'name email profile_image',
            });

            const activeUsers = [...onlineUsers];
            for (const participantId of activeUsers) {
                emitMessage(participantId.toString(), populatedMessage, `${ENUM_SOCKET_EVENT.MESSAGE_NEW_ORDER}/${orderId}`);
            }
        } catch (error) {
            console.error("Error handling new order message:", error);
            socket.emit("error", { message: "An error occurred while processing the message." });
        }
    });

    socket.on(ENUM_SOCKET_EVENT.REVISIONS_MESSAGE, async (data: { taskId: string; text: string; fileId: string }) => {
        const { taskId, fileId, text } = data;
        const senderId = socket.handshake.auth?.userId;

        try {
            if (!text || !taskId || !fileId) {
                socket.emit("error", { message: "Task ID, File ID, or Text is missing!" });
                return;
            }
            if (!senderId) {
                socket.emit("error", { message: "Sender ID is missing." });
                return;
            }

            const task = await Tasks.findById(taskId) as any;
            if (!task) {
                socket.emit("error", { message: "Task not found." });
                return;
            }

            let image: any;
            if (task.finishFile?.length > 0) {
                image = task.finishFile.find((file: any) => file._id?.toString() === fileId)?.url;
            }

            const orderId = task.orderId;

            let conversation = await Conversation.findOne({ orderId });
            if (!conversation) {
                conversation = await Conversation.create({
                    orderId,
                    participants: [senderId],
                });
            } else if (!conversation.participants.some(id => id.equals(senderId))) {
                conversation.participants.push(senderId);
            }

            const newMessage = new Message({
                senderId,
                message: text,
                message_img: image || null,
                isRevision: true,
                conversationId: conversation._id,
                fileId: fileId,
            });

            conversation.messages.push(newMessage._id);
            await Promise.all([conversation.save(), newMessage.save()]);

            // Creating a comment
            await Comment.create({
                taskId,
                fileId,
                isRevision: true,
                comments: [{ text, userId: senderId }],
            });

            // Populate sender details
            const populatedMessage = await Message.findById(newMessage._id).populate({
                path: "senderId",
                select: "name email profile_image",
            });

            // Emit message to active users
            const activeUsers = [...onlineUsers];
            for (const participantId of activeUsers) {
                emitMessage(participantId.toString(), populatedMessage, `${ENUM_SOCKET_EVENT.MESSAGE_NEW_ORDER}/${orderId}`);
            }
        } catch (error) {
            console.error("Error handling revision message:", error);
            socket.emit("error", { message: "An error occurred while processing the message." });
        }
    });

};

// Emit a message to a user
const emitMessage = (receiver: string, data: any, emitEvent: string): void => {
    console.log("emitMessage", receiver, data, emitEvent)
    //@ts-ignore
    const socketIo = global.io;
    if (socketIo) {
        socketIo.to(receiver).emit(emitEvent, data);
    } else {
        console.error("Socket.IO is not initialized");
    }
};

export { handleMessageData, emitMessage };
