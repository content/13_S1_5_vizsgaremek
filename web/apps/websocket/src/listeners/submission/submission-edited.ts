import { Course, Post, Submission } from "@studify/types";
import { Socket } from "socket.io";

export const registerSubmissionEditedListener = (socket: Socket) => {
    socket.on("submission-edit", async (submission: Submission, post: Post, course: Course) => {
        const courseId = `course:${course.id}`;

        socket.to(courseId).emit("submission-edit", {
            submission,
            post,
            course,
        });
    });
};