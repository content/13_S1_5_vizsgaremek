import { Socket } from "socket.io";

export const registerNewCourseListener = (socket: Socket) => {
    socket.on("new-course", async (data) => {
    
    });
};