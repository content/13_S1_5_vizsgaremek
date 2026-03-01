import { Socket } from "socket.io";

import { registerCourseMemberJoinListener } from "./course/member-join";
import { registerCourseMemberLeaveListener } from "./course/member-leave";
import { registerNewCourseListener } from "./course/new-course";
import { registerMessageListener } from "./messages/message";
import { registerNewPostListener } from "./posts/new-post";
import { registerUserEmailVerificationListener } from "./user/email-verification";
import { registerUserRegisterListener } from "./user/user-register";
import { registerDeleteCourseListener } from "./course/course-deleted";

export const registerSocketListeners = (socket: Socket) => {
    registerDeleteCourseListener(socket);
    registerCourseMemberJoinListener(socket);
    registerCourseMemberLeaveListener(socket);
    registerNewCourseListener(socket);
    registerMessageListener(socket);
    registerNewPostListener(socket);
    registerUserEmailVerificationListener(socket);
    registerUserRegisterListener(socket);
};