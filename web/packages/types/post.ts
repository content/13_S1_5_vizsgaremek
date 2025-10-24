import { Attachment } from "./attachment";
import { User } from "./user";

export interface Message {
    id: number;
    sender: User;
    content: string;
    createdAt: Date;
}

export interface Comment {
    id: number;
    sender: User;
    message: string;
    createdAt: Date;
}

export interface PostType {
    id: number;
    name: string;
}

export interface Post {
    id: number;
    name: string;
    description: string;
    postType: PostType;
    deadlineAt: Date | null;
    isEdited: boolean;
    createdAt: Date;
    
    comments: Comment[];
    attachments: Attachment[];
}