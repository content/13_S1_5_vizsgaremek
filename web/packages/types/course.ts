import { Attachment } from './attachment';
import { Post } from './post';
import { User } from './user';

export interface CourseMember {
    user: User; 
    isTeacher: boolean;
    isApproved: boolean;
}

export interface Course {
    id: number;
    name: string;
    invitationCode: string;
    backgroundImage: Attachment | null;
    color: string;

    members: CourseMember[];
    posts: Post[];
}