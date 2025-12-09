import { db } from "../../mysql";
import { attachments } from "../../schema/attachments";

export async function createAttachment(uploaderId: number, filePath: string): Promise<number> {
    const result = await db
        .insert(attachments)
        .values({
            uploaderId,
            filePath,
        })
        .executeTakeFirstOrThrow();

    return result.insertId;
}