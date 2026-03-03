import { Socket } from "socket.io";

export const registerPrivateMessageListener = (socket: Socket) => {
    socket.on("private-message", async (message: any, senderId: number, recipientId: number) => {
        const recipientRoomId = `user:${recipientId}`;

        socket.to(recipientRoomId).emit("private-message", {
            message,
            senderId,
            recipientId,
        });
    });
};
