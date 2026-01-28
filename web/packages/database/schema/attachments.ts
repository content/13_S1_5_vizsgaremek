import { int, mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core';

import { users } from './users';

export const attachments = mysqlTable('attachments', {
    id: int('id').autoincrement().primaryKey().$type<number>(),
    uploaderId: int('uploader_id').notNull().references(() => users.id),
    fileName: varchar('file_name', { length: 255 }).notNull(),
    path: varchar('path', { length: 512 }).notNull(),
    uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
});