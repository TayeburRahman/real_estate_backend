import { Server, Socket } from 'socket.io'; 
// import { handleNotification } from '../app/modules/notification/notification.service';
// import { handlePartnerData } from '../app/modules/partner/partner.socket';
// import { handleMessageData } from '../app/modules/message/message.socket';
import { ENUM_SOCKET_EVENT } from '../enums/user';

// Set to keep track of online users
const onlineUsers = new Set<string>();

const socket = (io: Server) => {
  io.on(ENUM_SOCKET_EVENT.CONNECT, async (socket: Socket) => {
    const currentUserId = socket.handshake.query.id as string;
    const role = socket.handshake.query.role as string;

    socket.join(currentUserId);
    console.log("A user connected", currentUserId);

    // Add the user to the online users set
    onlineUsers.add(currentUserId);
    io.emit("onlineUser", Array.from(onlineUsers));

    // Handle message events
    // await handleMessageData(currentUserId, role, socket, io);

    // Handle notifications events
    // await handleNotification(currentUserId, role, socket, io);

    // Handle partner events
    // await handlePartnerData(currentUserId, role, socket, io);

    // Handle user disconnection
    socket.on("disconnect", () => {
      console.log("A user disconnected", currentUserId);
      onlineUsers.delete(currentUserId); // Remove user from online users
      io.emit("onlineUser", Array.from(onlineUsers)); // Update online user list
    });
  });
};

// Export the socket initialization function
export default socket;
