import { ENUM_SOCKET_EVENT } from "../../../enums/user";
import ApiError from "../../../errors/ApiError";
import Conversation from "./conversation.model";
import Message from "./message.model";
import { Comment, Tasks } from "../orders/order.model";


const handleMessageData = async (
    senderId: any,
    socket: any,
    onlineUsers: any,
): Promise<void> => {

    // Get Conversation All Messages
    socket.on(ENUM_SOCKET_EVENT.MESSAGE_GETALL, async (data: {
        receiverId: string,
        page: number,
    }) => {
        const { receiverId, page } = data as any;

        if (!receiverId) {
            socket.emit('error', {
                message: 'SenderId not found!',
            });
            return;
        }
        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
            orderId: null
        })
            .populate({
                path: 'messages',
                // options: {
                //     sort: { createdAt: -1 },
                //     skip: (page - 1) * 20,
                //     limit: 20,
                // },
                populate: [
                    { path: 'senderId', select: 'name email profile_image' },
                    { path: 'receiverId', select: 'name email profile_image' }
                ]
            });

        if (conversation) {
            await emitMessage(senderId, conversation, ENUM_SOCKET_EVENT.MESSAGE_GETALL)
        }
    },
    );
    // Send Message for Email
    socket.on(ENUM_SOCKET_EVENT.MESSAGE_EMAIL_NEW, async (data: { receiverId: string; text: string, email: string, subject: string }) => {
        const { receiverId, text, email, subject } = data;

        if (!receiverId || !text || !email) {
            socket.emit("error", { message: "SenderId or text is missing!" });
            return;
        }

        // console.log("senderId", senderId, text, email);

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
            message: text,
            subject: subject,
            conversationId: conversation._id,
        });

        console.log("conversation", newMessage, conversation);

        conversation.messages.push(newMessage._id);
        await Promise.all([conversation.save(), newMessage.save()]);

        // ====================
        const conversations = await Conversation.find({
            participants: { $in: [senderId] },
            orderId: null
        })
            .populate({
                path: 'participants',
                select: 'name email profile_image',
            })
            .populate({
                path: 'messages',
                options: { sort: { createdAt: -1 }, limit: 1 },
            })
            .sort({ updatedAt: -1 });

        await emitMessage(senderId, conversations, ENUM_SOCKET_EVENT.CONVERSION_LIST);
        // ==========================
        const messages = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
            orderId: null
        })
            .populate({
                path: 'messages',
                // options: {
                //     sort: { createdAt: -1 },
                //     skip: (page - 1) * 20,
                //     limit: 20,
                // },
                populate: [
                    { path: 'senderId', select: 'name email profile_image' },
                    { path: 'receiverId', select: 'name email profile_image' }
                ]
            });

        if (messages) {
            await emitMessage(senderId, messages, ENUM_SOCKET_EVENT.MESSAGE_GETALL)
        }

        // =========================== 
        await emitMessage(senderId, newMessage, `${ENUM_SOCKET_EVENT.MESSAGE_EMAIL_NEW}/${receiverId}`);
        await emitMessage(receiverId, newMessage, `${ENUM_SOCKET_EVENT.MESSAGE_EMAIL_NEW}/${senderId}`);
    });

    // Get Order All Messages
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
    // Send Message for Orders
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
    // Send Revisions for Orders
    socket.on(ENUM_SOCKET_EVENT.REVISIONS_MESSAGE, async (
        data: { taskId: string; text: string; fileId: string },
        callback: (response: any) => void
    ) => {
        const { taskId, fileId, text } = data;
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
                taskId: taskId
            });

            conversation.messages.push(newMessage._id);
            await Promise.all([conversation.save(), newMessage.save()]);

            const comment = await Comment.create({
                taskId,
                fileId,
                isRevision: true,
                comment: {
                    text,
                    userId: senderId
                }
            });

            const populatedMessage = await Message.findById(newMessage._id).populate({
                path: "senderId",
                select: "name email profile_image",
            });

            const activeUsers = [...onlineUsers];
            for (const participantId of activeUsers) {
                emitMessage(participantId.toString(), populatedMessage, `${ENUM_SOCKET_EVENT.MESSAGE_NEW_ORDER}/${orderId}`);
            }

            callback({
                status: "ok",
                comment,
            });
        } catch (error) {
            console.error("Error handling revision message:", error);
            socket.emit("error", { message: "An error occurred while processing the message." });
        }
    });
    // Get Conversation List
    socket.on(ENUM_SOCKET_EVENT.CONVERSION_LIST, async () => {
        try {

            const conversations = await Conversation.find({
                participants: { $in: [senderId] },
                orderId: null
            })
                .populate({
                    path: 'participants',
                    select: 'name email profile_image',
                })
                .populate({
                    path: 'messages',
                    options: { sort: { createdAt: -1 }, limit: 1 },
                    // populate: {
                    //     path: 'senderId',
                    //     select: 'name email profile_image',
                    // }
                })
                .sort({ updatedAt: -1 });

            console.log("conversations", conversations)

            await emitMessage(senderId, conversations, ENUM_SOCKET_EVENT.CONVERSION_LIST);

        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    });






};

// Emit a message to a user
const emitMessage = (receiver: string, data: any, emitEvent: string): void => {
    //@ts-ignore
    const socketIo = global.io;
    if (socketIo) {
        socketIo.to(receiver).emit(emitEvent, data);
    } else {
        console.error("Socket.IO is not initialized");
    }
};

export { handleMessageData, emitMessage };
