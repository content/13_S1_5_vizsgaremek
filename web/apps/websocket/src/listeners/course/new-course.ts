import { Course, CourseMember } from "@studify/types";
import { Socket } from "socket.io";

export const registerNewCourseListener = (socket: Socket) => {
    socket.on("new-course", async (course: Course, member: CourseMember) => {
    
    });
};