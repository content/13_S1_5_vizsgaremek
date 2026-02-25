import { Socket } from "socket.io";

export const registerUserEmailVerificationListener = (socket: Socket) => {
    socket.on("user-email-verification", async (data) => {
        
    });
};