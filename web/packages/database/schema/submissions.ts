import { int, mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core';

import { posts } from './posts';
import { users } from './users';
import { attachments } from './attachments';

export const submissions = mysqlTable("submissions", {
    id: int("id").autoincrement().primaryKey(),
    postId: int("post_id").notNull().references(() => posts.id),
    userId: int("user_id").notNull().references(() => users.id),
    statusId: int("status_id").notNull().references(() => submissionStatuses.id),
    lastHistoryId: int("last_history_id"),
    score: int("score"),
    submittedAt: timestamp("submitted_at"),
});

export const submissionHistories = mysqlTable("submission_histories", {
    id: int("id").autoincrement().primaryKey(),
    submissionId: int("submission_id").notNull().references(() => submissions.id),
    versionNumber: int("version_number").notNull(),
    score: int("score"),
    submittedAt: timestamp("submitted_at"),
});

export const submissionStatuses = mysqlTable("submission_statuses", {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
});

export const submissionHistoryAttachments = mysqlTable("sub_hist_attachments", {
    historyId: int("history_id").notNull().references(() => submissionHistories.id),
    attachmentId: int("attachment_id").notNull().references(() => attachments.id)
});