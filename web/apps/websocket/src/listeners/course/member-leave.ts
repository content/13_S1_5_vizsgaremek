import { Course, CourseMember } from "@studify/types";
import { Socket } from "socket.io";

export const registerCourseMemberLeaveListener = (socket: Socket) => {
    socket.on("course-member-leave", async (course: Course, member: CourseMember) => {
        const courseId = `course:${course.id}`;

        socket.to(courseId).emit("course-member-leave", {
            course,
            member,
        });
    });
};