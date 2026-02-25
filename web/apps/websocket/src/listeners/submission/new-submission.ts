import { Course, Post, Submission } from "@studify/types";
import { Socket } from "socket.io";

export const registerNewSubmissionListener = (socket: Socket) => {
    socket.on("new-submission", async (submission: Submission, post: Post, course: Course) => {
        const courseId = `course:${course.id}`;

        socket.to(courseId).emit("new-submission", {
            submission,
            post,
            course,
        });
    });
};