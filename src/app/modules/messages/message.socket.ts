import { Types } from "mongoose";
import { ENUM_SOCKET_EVENT } from "../../../enums/user";
import ApiError from "../../../errors/ApiError";
import Conversation from "./conversation.model";
import Message from "./message.model";


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

            const activeUsers = [...onlineUsers]
            // Notify all conversation participants
            for (const participantId of activeUsers) {
                emitMessage(participantId.toString(), newMessage, `${ENUM_SOCKET_EVENT.MESSAGE_NEW_ORDER}/${orderId}`);
            }
        } catch (error) {
            console.error("Error handling new order message:", error);
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
