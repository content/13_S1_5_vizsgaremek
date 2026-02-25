import { Course, CourseMember } from "@studify/types";
import { Socket } from "socket.io";

export const registerCourseMemberJoinListener = (socket: Socket) => {
    socket.on("course-member-join", async (course: Course, member: CourseMember) => {
        const courseId = `course:${course.id}`;

        socket.to(courseId).emit("course-member-join", {
            course,
            member,
        });
    });
};