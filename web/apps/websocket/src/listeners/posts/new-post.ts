import { Course, Post } from "@studify/types";
import { Socket } from "socket.io";

export const registerNewPostListener = (socket: Socket) => {
    socket.on("new-post", async (post: Post, course: Course) => {
        const courseId = `course:${course.id}`;

        socket.to(courseId).emit("new-post", {
            post,
            course,
        });
    });
};