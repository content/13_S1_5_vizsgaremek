import { Attachment } from "./attachment";
import { Submission } from "./submission";
import { User } from "./user";

export interface Message {
    id: number;
    sender: User;
    recipient: User;
    content: string;
    createdAt: Date;
}

export interface Comment {
    id: number;
    post: Post;
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
    pollPostOptions?: PollPostOption[];
    submissions?: Submission[];
    maxScore?: number;
    author: User;
    comments: Comment[];
    attachments: Attachment[];
}

export interface PollPostOption {
    id: number;
    optionText: string;
    voteCount: number;
}