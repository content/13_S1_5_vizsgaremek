import { isUserCourseMember } from "@studify/database";
import { Course, CourseMember } from "@studify/types";
import { Socket } from "socket.io";

export const registerCourseMemberLeaveListener = (socket: Socket) => {
    socket.on("course-member-leave", async (course: Course, member: CourseMember) => {
        const user = socket.data.user;
        if (!user) return;
    
        const allowed = await isUserCourseMember(course.id, user.sub.id);
        if (!allowed) return;
        
        const courseId = `course:${course.id}`;

        socket.to(courseId).emit("course-member-leave", {
            course,
            member,
        });
    });
};