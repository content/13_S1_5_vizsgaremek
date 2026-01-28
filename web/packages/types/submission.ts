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
    
    history: HistorySubmission[];
    submittedAt: Date | null;
    score: number | null;
}

export interface HistorySubmission {
    id: number;
    attachments: Attachment[];
    submittedAt: Date | null;
    score: number | null;
    versionNumber: number;
}