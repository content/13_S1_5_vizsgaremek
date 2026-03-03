import { Socket } from "socket.io";

import { registerCourseMemberJoinListener } from "./course/member-join";
import { registerCourseMemberLeaveListener } from "./course/member-leave";
import { registerNewCourseListener } from "./course/new-course";
import { registerMessageListener } from "./messages/message";
import { registerNewPostListener } from "./posts/new-post";
import { registerUserEmailVerificationListener } from "./user/email-verification";
import { registerUserRegisterListener } from "./user/user-register";
import { registerDeleteCourseListener } from "./course/course-deleted";
import { registerCommentCreatedListener } from "./posts/comment-created";
import { registerPrivateMessageListener } from "./messages/private-message";
import { registerCourseSettingsUpdatedListener } from "./course/settings-updated";
import { registerCourseMemberPromotedListener } from "./course/member-promoted";
import { registerCourseMemberDemotedListener } from "./course/member-demoted";

export const registerSocketListeners = (socket: Socket) => {
    registerDeleteCourseListener(socket);
    registerCourseMemberJoinListener(socket);
    registerCourseMemberLeaveListener(socket);
    registerNewCourseListener(socket);
    registerMessageListener(socket);
    registerNewPostListener(socket);
    registerUserEmailVerificationListener(socket);
    registerUserRegisterListener(socket);
    registerCommentCreatedListener(socket);
    registerPrivateMessageListener(socket);
    registerCourseSettingsUpdatedListener(socket);
    registerCourseMemberPromotedListener(socket);
    registerCourseMemberDemotedListener(socket);
};