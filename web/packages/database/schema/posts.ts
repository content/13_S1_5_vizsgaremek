import { int, mysqlTable, timestamp, varchar, boolean } from 'drizzle-orm/mysql-core';

import { courses } from "./courses";
import { attachments } from "./attachments";
import { users } from "./users";

export const posts = mysqlTable('posts', {
    id: int('id').autoincrement().primaryKey(),
    courseId: int('course_id').notNull().references(() => courses.id),
    name: varchar('name', { length: 255 }).notNull(),
    description: varchar('description', { length: 1024 }),
    postTypeId: int('post_type_id').notNull().references(() => postTypes.id),
    isEdited: boolean('is_edited').notNull().default(false),
    deadlineAt: timestamp('deadline_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const comments = mysqlTable('comments', {
    id: int('id').autoincrement().primaryKey(),
    postId: int('post_id').notNull().references(() => posts.id),
    senderId: int('sender_id').notNull().references(() => users.id),
    content: varchar('content', { length: 2048 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

export const postMessages = mysqlTable('post_messages', {
    id: int('id').autoincrement().primaryKey(),
    postId: int('post_id').notNull().references(() => posts.id),
    senderId: int('sender_id').notNull().references(() => users.id),
    recipientId: int('recipient_id').notNull().references(() => users.id),
    maxScore: int('max_score'),
    message: varchar('message', { length: 2048 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

export const postTypes = mysqlTable('post_types', {
    id: int('id').autoincrement().primaryKey(),
    name: varchar('name', { length: 100 }).notNull().unique(),
});

export const postAttachments = mysqlTable('post_attachments', {
    postId: int('post_id').notNull().references(() => posts.id),
    attachmentId: int('attachment_id').notNull().references(() => attachments.id),
});