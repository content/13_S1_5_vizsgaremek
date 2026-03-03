import { Course, CourseMember } from "@studify/types";
import { Socket } from "socket.io";

export const registerCourseMemberDemotedListener = (socket: Socket) => {
    socket.on("course-member-demoted", async (course: Course, member: CourseMember) => {
        const roomId = `course:${course.id}`;

        socket.to(roomId).emit("course-member-demoted", {
            course,
            member,
        });
    });
};
