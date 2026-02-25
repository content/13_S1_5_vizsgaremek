import { Socket } from "socket.io";

export const registerCourseMemberJoinListener = (socket: Socket) => {
    socket.on("course-member-join", async (data) => {
        
    });
};