import { int, mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core';

import { attachments } from './attachments';

export const users = mysqlTable('users', {
    id: int('id').autoincrement().primaryKey(),
    firstName: varchar('first_name', { length: 255 }).notNull(),
    lastName: varchar('last_name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    profilePicture: varchar('profile_picture', { length: 512 }),
});

export const profilePictureAttachments = mysqlTable('profile_picture_attachments', {
    userId: int('user_id').notNull().references(() => users.id),
    attachmentId: int('attachment_id').notNull().references(() => attachments.id),
});