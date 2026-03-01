import { getCourseById, isUserCourseMember } from "@studify/database";
import { CourseMember } from "@studify/types";
import { Socket } from "socket.io";

export default function registerCourseMemberDeclinedListener(socket: Socket) {
    socket.on("course-member-declined", async (courseId: number, userId: number) => {
        const user = socket.data.user;
        if (!user) return;

        const allowed = await isUserCourseMember(courseId, userId);
        if (!allowed) return;

        const course = await getCourseById(courseId);
        if (!course) return;

        const member = course.members.find((m: CourseMember) => m.user.id === userId);

        const roomId = `course:${course.id}`;
        socket.to(roomId).emit("course-member-declined", {
            course,
            member,
        });
    });
}