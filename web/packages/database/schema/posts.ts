import { int, mysqlTable, timestamp, varchar, boolean } from 'drizzle-orm/mysql-core';

import { courses } from "./courses";
import { attachments } from "./attachments";
import { users } from "./users";
import { sql } from 'drizzle-orm';

export const posts = mysqlTable('posts', {
    id: int('id').autoincrement().primaryKey().$type<number>(),
    courseId: int('course_id').notNull().references(() => courses.id),
    name: varchar('name', { length: 255 }).notNull(),
    description: varchar('description', { length: 1024 }),
    postTypeId: int('post_type_id').notNull().references(() => postTypes.id),
    isEdited: boolean('is_edited').notNull().default(false),
    deadlineAt: timestamp('deadline_at').default(sql`NULL`),
    maxScore: int('max_score'),
    authorId: int('author_id').notNull().references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const pollPostsOptions = mysqlTable('poll_post_options', {
    id: int('id').autoincrement().primaryKey().$type<number>(),
    postId: int('post_id').notNull().references(() => posts.id),
    optionText: varchar('option_text', { length: 255 }).notNull(),
});

export const pollPostVotes = mysqlTable('poll_post_votes', {
    id: int('id').autoincrement().primaryKey().$type<number>(),
    postId: int('post_id').notNull().references(() => posts.id),
    optionId: int('option_id').notNull().references(() => pollPostsOptions.id),
    voterId: int('voter_id').notNull().references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

export const comments = mysqlTable('comments', {
    id: int('id').autoincrement().primaryKey().$type<number>(),
    postId: int('post_id').notNull().references(() => posts.id),
    senderId: int('sender_id').notNull().references(() => users.id),
    content: varchar('content', { length: 2048 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

export const postMessages = mysqlTable('post_messages', {
    id: int('id').autoincrement().primaryKey().$type<number>(),
    postId: int('post_id').notNull().references(() => posts.id),
    senderId: int('sender_id').notNull().references(() => users.id),
    recipientId: int('recipient_id').notNull().references(() => users.id),
    maxScore: int('max_score'),
    message: varchar('message', { length: 2048 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

export const postTypes = mysqlTable('post_types', {
    id: int('id').autoincrement().primaryKey().$type<number>(),
    name: varchar('name', { length: 100 }).notNull().unique(),
});

export const postAttachments = mysqlTable('post_attachments', {
    postId: int('post_id').notNull().references(() => posts.id),
    attachmentId: int('attachment_id').notNull().references(() => attachments.id),
});
