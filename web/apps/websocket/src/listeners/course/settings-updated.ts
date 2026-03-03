import { Course } from "@studify/types";
import { Socket } from "socket.io";

export const registerCourseSettingsUpdatedListener = (socket: Socket) => {
    socket.on("course-settings-updated", async (course: Course, settings: any) => {
        const roomId = `course:${course.id}`;

        socket.to(roomId).emit("course-settings-updated", {
            course,
            settings,
        });
    });
};
