import { Socket } from "socket.io";

export const registerCourseMemberLeaveListener = (socket: Socket) => {
    socket.on("course-member-leave", async (data) => {
        
    });
};