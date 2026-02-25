import { Course, Post, Submission } from "@studify/types";
import { Socket } from "socket.io";

export const registerSubmissionGradedListener = (socket: Socket) => {
    socket.on("submission-graded", async (submission: Submission, post: Post, course: Course) => {
        const courseId = `course:${course.id}`;

        socket.to(courseId).emit("submission-graded", {
            submission,
            post,
            course,
        });
    });
};