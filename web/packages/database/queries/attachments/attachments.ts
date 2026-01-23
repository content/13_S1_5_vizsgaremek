import { MySqlTableWithColumns } from "drizzle-orm/mysql-core";
import { eq } from 'drizzle-orm';
import { db } from "../../mysql";
import { attachments } from "../../schema/attachments";
import { postAttachments } from "@studify/database/schema/posts";
import { Attachment } from "@studify/types";
import { backgroundAttachments, courses } from "@studify/database/schema/courses";

export async function createAttachment(uploaderId: number, filePath: string): Promise<Attachment> {
    const result = await db
        .insert(attachments)
        .values({
            uploaderId,
            path: filePath,
        })
        .execute();

    const attachment = result[0];

    return {
        id: attachment.insertId,
        uploaderId: uploaderId,
        path: filePath,
        uploadedAt: new Date(),
    } as unknown as Attachment;
}

interface CreateRelationParams {
    foreignId: number;
    attachmentId: number;
    table: MySqlTableWithColumns<any>;
}

export async function createRelation({ foreignId, attachmentId, table }: CreateRelationParams): Promise<number> {
    const columns = Object.keys(table);

    const foreignKeyColumn = columns.find(col => col !== 'attachmentId' && col.endsWith('Id'));
    
    if(!foreignKeyColumn) {
        throw new Error('Foreign key column not found in the provided table.');
    }

    const result = await db
        .insert(table)
        .values({
            [foreignKeyColumn]: foreignId,
            attachmentId,
        })
        .execute();

    return result[0].insertId;
}

export async function getAttachmentsByPostId(postId: number): Promise<Attachment[]> {
    const results = await db
        .select()
        .from(attachments)
        .innerJoin(
            postAttachments,
            eq(attachments.id, postAttachments.attachmentId)
        )
        .where(eq(postAttachments.postId, postId))
        .execute();

    const mappedResults = results.map((result) => ({
        id: result.attachments.id,
        uploaderId: result.attachments.uploaderId,
        path: result.attachments.path,
        uploadedAt: result.attachments.uploadedAt,
    })) as Attachment[];

    return mappedResults;
}

export async function getCourseBackgroundImage(courseId: number): Promise<Attachment | null> {
    const result = await db
        .select()
        .from(attachments)
        .innerJoin(
            backgroundAttachments,
            eq(attachments.id, backgroundAttachments.attachmentId)
        )
        .innerJoin(
            courses,
            eq(backgroundAttachments.courseId, courses.id)
        )
        .where(eq(courses.id, courseId))
        .execute();

    if (result.length === 0) {
        return null;
    }

    const attachment = result[0].attachments;

    return {
        id: attachment.id,
        uploaderId: attachment.uploaderId,
        path: attachment.path,
        uploadedAt: attachment.uploadedAt,
    } as Attachment;
}