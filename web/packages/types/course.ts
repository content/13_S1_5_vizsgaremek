import { Attachment } from './attachment';
import { Post, PostType } from './post';
import { User } from './user';

export interface CourseMember {
    user: User; 
    isTeacher: boolean;
    isApproved: boolean;
    isBanned: boolean;
}

export interface Course {
    id: number;
    name: string;
    invitationCode: string;
    backgroundImage: Attachment | null;
    color: string;
    settings: CourseSettings;

    members: CourseMember[];
    posts: Post[];
}

export interface CourseSettings {
    allowComments: boolean;
    showInviteCode: boolean;
    studentsCanCreatePosts: boolean;
    autoApproveMembers: boolean;
    autoRejectMembers: boolean;
    allowedStudentPostTypes: PostType[];
}