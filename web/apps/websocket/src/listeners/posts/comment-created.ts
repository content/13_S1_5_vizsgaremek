import { Post } from "@studify/types";
import { Socket } from "socket.io";

export const registerCommentCreatedListener = (socket: Socket) => {
    socket.on("comment-created", async (comment: any, post: Post, courseId: number) => {
        const roomId = `course:${courseId}`;
        const postRoomId = `post:${post.id}`;

        socket.to(roomId).emit("comment-created", {
            comment,
            post,
            courseId,
        });

        socket.to(postRoomId).emit("comment-created", {
            comment,
            post,
            courseId,
        });
    });
};
