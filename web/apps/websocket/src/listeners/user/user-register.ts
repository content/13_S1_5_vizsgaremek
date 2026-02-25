import { Socket } from "socket.io";

export const registerUserRegisterListener = (socket: Socket) => {
    socket.on("user-registered", async (data) => {
        
    });
};