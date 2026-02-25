import { Socket } from "socket.io";

export const registerNewPostListener = (socket: Socket) => {
    socket.on("new-post", async (post) => {

    });
};