import { Attachment } from './attachment';
import { User } from './user';

export interface SubmissionStatus {
    id: number;
    name: string;
}

export interface Submission {
    id: number;
    student: User;
    status: SubmissionStatus;
    
    attachments: Attachment[];
    
    history: Submission[];
    submittedAt: Date | null;
}