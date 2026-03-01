import { isUserCourseMember } from "@studify/database";
import { Socket } from "socket.io";

export const registerDeleteCourseListener = (socket: Socket) => {
    socket.on("delete-course", async (courseId: string) => {        
        const user = socket.data.user;
        if (!user) return;
    
        const allowed = await isUserCourseMember(+courseId, user.sub.id);
        if (!allowed) return;
        
        const roomId = `course:${courseId}`;

        socket.to(roomId).emit("course-deleted", {
            course: courseId,
        });
    });
}