import { and, eq } from 'drizzle-orm';

import { submissionHistories, submissions } from '@studify/database/schema/submissions';
import { Attachment, HistorySubmission, Submission, SubmissionStatus } from '@studify/types';
import { submissionHistoryAttachments, submissionStatuses } from '@studify/database/schema/submissions';
import { db } from '../../mysql';
import { createAttachment, createRelation, getAttachmentById, getAttachmentsBySubmissionHistoryId } from '../attachments/attachments';
import { getUserById, getUserByIdWithoutCourses } from '../users/users';

export async function createSubmission(postId: number, userId: number, attachments: { path: string, name: string }[]): Promise<Submission> {
    const result = await db
        .insert(submissions)
        .values({
            postId,
            userId,
            statusId: 1,
        })
        .execute();
    
    const submissionId = result[0].insertId;
    
    const historyId = await createHistory(submissionId, 1);
    
    await updateLastHistoryId(submissionId, historyId);
    
    const createdAttachments: Attachment[] = [];
    
    for (const attachment of attachments) {
        const createdAttachment = await createAttachment(userId, attachment.path, attachment.name);
        await createRelation({ 
            foreignId: historyId, 
            attachmentId: createdAttachment.id, 
            table: submissionHistoryAttachments 
        });
        
        createdAttachments.push(createdAttachment);
    }
    
    const user = await getUserByIdWithoutCourses(userId);
    const status = await getSubmissionStatusById(1);
    
    const firstHistory: HistorySubmission = {
        id: historyId,
        attachments: createdAttachments,
        submittedAt: new Date(),
        score: null,
        versionNumber: 1,
    };

    return {
        id: submissionId,
        student: user,
        status: status,
        attachments: createdAttachments,
        history: [firstHistory],
        score: null,
        submittedAt: new Date(),
    };
}

export async function editSubmission(submissionId: number, userId: number, newAttachments: { path: string, name: string }[], keepExistingAttachmentIds: number[] = []): Promise<Submission> {
    const currentSubmission = await getSubmissionById(submissionId);
    const nextVersion = currentSubmission.history.length > 0 
        ? currentSubmission.history[currentSubmission.history.length - 1].versionNumber + 1 
        : 1;
    
    const historyId = await createHistory(submissionId, nextVersion);
    
    await updateLastHistoryId(submissionId, historyId);
    
    const versionAttachments: Attachment[] = [];
    
    for (const attachmentId of keepExistingAttachmentIds) {
        await createRelation({ 
            foreignId: historyId, 
            attachmentId: attachmentId,
            table: submissionHistoryAttachments 
        });
        
        
        const existingAttachment = await getAttachmentById(attachmentId);
        if (existingAttachment) {
            versionAttachments.push(existingAttachment);
        }
    }
    
    for (const attachment of newAttachments) {
        const createdAttachment = await createAttachment(userId, attachment.path, attachment.name);
        await createRelation({ 
            foreignId: historyId, 
            attachmentId: createdAttachment.id, 
            table: submissionHistoryAttachments 
        });
        
        versionAttachments.push(createdAttachment);
    }
    
    const newHistory: HistorySubmission = {
        id: historyId,
        attachments: versionAttachments,
        submittedAt: null,
        score: null,
        versionNumber: nextVersion,
    };
    
    return {
        ...currentSubmission,
        attachments: versionAttachments, 
        history: [...currentSubmission.history, newHistory],
    };
}

export async function getSubmissionHistory(submissionId: number): Promise<HistorySubmission[]> {
    const result = await db
        .select()
        .from(submissionHistories)
        .where(eq(submissionHistories.submissionId, submissionId))
        .execute();

    const histories: HistorySubmission[] = [];

    for (const historyRecord of result) {
        const attachments = await getAttachmentsBySubmissionHistoryId(historyRecord.id);
        histories.push({
            id: historyRecord.id,
            attachments: attachments,
            submittedAt: historyRecord.submittedAt,
            score: historyRecord.score,
            versionNumber: historyRecord.versionNumber,
        });
    }

    return histories;
}

export async function getSubmissionById(submissionId: number): Promise<Submission> {
    const result = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, submissionId))
        .execute();

    const submissionRecord = result[0];

    if(!submissionRecord) {
        return null;
    }

    const attachments = await getAttachmentsBySubmissionHistoryId(submissionRecord.lastHistoryId);
    const user = await getUserById(submissionRecord.userId);
    const status = await getSubmissionStatusById(submissionRecord.statusId);
    const history = await getSubmissionHistory(submissionRecord.id);

    return {
        id: submissionRecord.id,
        student: user,
        status: status,
        history: history,
        submittedAt: submissionRecord.submittedAt,
        score: submissionRecord.score,
        attachments: attachments,
    } as unknown as Submission;
}

export async function getAllSubmissionsByPostId(postId: number): Promise<Submission[]> {
    const result = await db
        .select()
        .from(submissions)
        .where(eq(submissions.postId, postId))
        .execute();

    const submissionz: Submission[] = [];

    for (const submissionRecord of result) {
        const attachments = await getAttachmentsBySubmissionHistoryId(submissionRecord.lastHistoryId);
        const user = await getUserByIdWithoutCourses(submissionRecord.userId);
        const status = await getSubmissionStatusById(submissionRecord.statusId);
        const history = await getSubmissionHistory(submissionRecord.id);

        submissionz.push({
            id: submissionRecord.id,
            student: user,
            status: status,
            history: history,
            submittedAt: submissionRecord.submittedAt,
            score: submissionRecord.score,
            attachments: attachments,
        } as unknown as Submission);
    }

    return submissionz;
}

export async function updateLastHistoryId(submissionId: number, newHistoryId: number): Promise<boolean> {
    const result = await db
        .update(submissions)
        .set({
            lastHistoryId: newHistoryId,
        })
        .where(eq(submissions.id, submissionId))
        .execute();
        
    return result[0].affectedRows > 0;
}


export async function createHistory(submissionId: number, versionNumber: number): Promise<number> {
    const result = await db
        .insert(submissionHistories)
        .values({
            submissionId: submissionId,
            versionNumber: versionNumber,
        })
        .execute();

    return result[0].insertId;
}

export async function getSubmissionByPostAndUserId(postId: number, userId: number): Promise<Submission> {
    const result = await db
        .select()
        .from(submissions)
        .where(and(
            eq(submissions.postId, postId),
            eq(submissions.userId, userId),
        ))
        .execute();

    const submissionRecord = result[0];

    if(!submissionRecord) {
        return null;
    }

    const attachments = await getAttachmentsBySubmissionHistoryId(submissionRecord.lastHistoryId);
    const user = await getUserById(submissionRecord.userId);
    const status = await getSubmissionStatusById(submissionRecord.statusId);
    const history = await getSubmissionHistory(submissionRecord.id);

    return {
        id: submissionRecord.id,
        student: user,
        status: status,
        history: history,
        submittedAt: submissionRecord.submittedAt,
        score: submissionRecord.score,
        attachments: attachments,
    }
}

export async function getSubmissionStatusById(submissionId: number): Promise<SubmissionStatus> {
    const result = await db
        .select()
        .from(submissionStatuses)
        .where(eq(submissionStatuses.id, submissionId))
        .execute();

    const submissionRecord = result[0];

    if (!submissionRecord) {
        return null;
    }
    
    return {
        id: submissionRecord.id,
        name: submissionRecord.name,
    } as unknown as SubmissionStatus;
}