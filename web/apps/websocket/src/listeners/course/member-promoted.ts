import { Course, CourseMember } from "@studify/types";
import { Socket } from "socket.io";

export const registerCourseMemberPromotedListener = (socket: Socket) => {
    socket.on("course-member-promoted", async (course: Course, member: CourseMember) => {
        const roomId = `course:${course.id}`;

        socket.to(roomId).emit("course-member-promoted", {
            course,
            member,
        });
    });
};
