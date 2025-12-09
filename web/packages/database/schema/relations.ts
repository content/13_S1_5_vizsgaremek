import { relations } from 'drizzle-orm';
import { users, profilePictureAttachments } from './users';
import { posts } from './posts';
import { submissions, submissionHistories, submissionStatuses, submissionAttachments } from './submissions';
import { courses, coursesMembers, backgroundAttachments } from './courses';
import { attachments } from './attachments';
import { comments, postMessages, postTypes, postAttachments } from './posts';

export const usersRelations = relations(users, ({ many, one }) => ({
  courseMemberships: many(coursesMembers),
  submissions: many(submissions),
  comments: many(comments),
  uploadedAttachments: many(attachments),
  sentMessages: many(postMessages, { relationName: 'sender' }),
  receivedMessages: many(postMessages, { relationName: 'recipient' }),
}));

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
  post: one(posts, {
    fields: [submissions.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [submissions.userId],
    references: [users.id],
  }),
  status: one(submissionStatuses, {
    fields: [submissions.statusId],
    references: [submissionStatuses.id],
  }),
  lastHistory: one(submissionHistories, {
    fields: [submissions.lastHistoryId],
    references: [submissionHistories.id],
  }),
  histories: many(submissionHistories),
  attachments: many(submissionAttachments),
}));

export const submissionHistoriesRelations = relations(submissionHistories, ({ one }) => ({
  submission: one(submissions, {
    fields: [submissionHistories.submissionId],
    references: [submissions.id],
  }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  course: one(courses, {
    fields: [posts.courseId],
    references: [courses.id],
  }),
  postType: one(postTypes, {
    fields: [posts.postTypeId],
    references: [postTypes.id],
  }),
  comments: many(comments),
  submissions: many(submissions),
  attachments: many(postAttachments),
  messages: many(postMessages),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  members: many(coursesMembers),
  posts: many(posts),
  backgroundAttachments: many(backgroundAttachments),
}));

export const attachmentsRelations = relations(attachments, ({ one, many }) => ({
  uploader: one(users, {
    fields: [attachments.uploaderId],
    references: [users.id],
  }),
  postAttachments: many(postAttachments),
  submissionAttachments: many(submissionAttachments),
  backgroundAttachments: many(backgroundAttachments),
}));

export const coursesMembersRelations = relations(coursesMembers, ({ one }) => ({
  course: one(courses, {
    fields: [coursesMembers.courseId],
    references: [courses.id],
  }),
  user: one(users, {
    fields: [coursesMembers.userId],
    references: [users.id],
  }),
}));

export const submissionAttachmentsRelations = relations(submissionAttachments, ({ one }) => ({
  submission: one(submissions, {
    fields: [submissionAttachments.submissionId],
    references: [submissions.id],
  }),
  attachment: one(attachments, {
    fields: [submissionAttachments.attachmentId],
    references: [attachments.id],
  }),
}));