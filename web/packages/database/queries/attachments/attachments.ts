import { MySqlTableWithColumns } from "drizzle-orm/mysql-core";
import { db } from "../../mysql";
import { attachments } from "../../schema/attachments";
import { MySqlRawQueryResult } from "drizzle-orm/mysql2";

export async function createAttachment(uploaderId: number, filePath: string): Promise<number> {
    const result = await db
        .insert(attachments)
        .values({
            uploaderId,
            path: filePath,
        })
        .execute();

    return result[0].insertId;
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

    const result = (await db
        .insert(table)
        .values({
            [foreignKeyColumn]: foreignId,
            attachmentId,
        })
        .execute())[0];

    return result.insertId;
}