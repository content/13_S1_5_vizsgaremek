import { mysqlTable, int, varchar, boolean } from 'drizzle-orm/mysql-core';

import { users } from './users';
import { attachments } from './attachments';

export const courses = mysqlTable('courses', {
    id: int('id').autoincrement().primaryKey().$type<number>(),
    name: varchar('name', { length: 255 }).notNull(),
    invitationCode: varchar('invitation_code', { length: 9 }).notNull().unique(),
});

export const coursesMembers = mysqlTable('courses_members', {
    courseId: int('course_id').notNull().references(() => courses.id),
    userId: int('user_id').notNull().references(() => users.id),
    isTeacher: boolean('is_teacher').notNull().default(false),
    isApproved: boolean('is_approved').notNull().default(false),
});

export const backgroundAttachments = mysqlTable('background_attachments', {
    courseId: int('course_id').notNull().references(() => courses.id),
    attachmentId: int('attachment_id').notNull().references(() => attachments.id),
});