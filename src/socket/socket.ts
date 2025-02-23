import { Server, Socket } from 'socket.io';
import { ENUM_SOCKET_EVENT } from '../enums/user';
import { handleMessageData } from '../app/modules/messages/message.socket';

const onlineUsers = new Set<string>();

const socket = (io: Server) => {
  io.on(ENUM_SOCKET_EVENT.CONNECT, async (socket: Socket) => {
    const currentUserId = socket.handshake.query.id as any;

    socket.join(currentUserId);
    console.log("A user connected", currentUserId);

    onlineUsers.add(currentUserId);
    io.emit("onlineUser", Array.from(onlineUsers));

    // Handle message events
    await handleMessageData(currentUserId, socket, onlineUsers);

    // Handle notifications events
    // await handleNotification(currentUserId, role, socket, io);

    // Handle partner events
    // await handlePartnerData(currentUserId, role, socket, io);

    // Handle user disconnection
    socket.on("disconnect", () => {
      console.log("A user disconnected", currentUserId);
      onlineUsers.delete(currentUserId);
      io.emit("onlineUser", Array.from(onlineUsers));
    });
  });
};

// Export the socket initialization function
export default socket;
