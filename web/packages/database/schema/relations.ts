import { relations } from 'drizzle-orm';
import { attachments } from './attachments';
import { backgroundAttachments, courses, coursesMembers } from './courses';
import { comments, postAttachments, postMessages, posts, postTypes } from './posts';
import { submissionHistories, submissionHistoryAttachments, submissions, submissionStatuses } from './submissions';
import { profilePictureAttachments, users } from './users';

export const usersRelations = relations(users, ({ many, one }) => ({
  courseMemberships: many(coursesMembers),
  submissions: many(submissions),
  comments: many(comments),
  uploadedAttachments: many(attachments),
  sentMessages: many(postMessages, { relationName: 'sender' }),
  receivedMessages: many(postMessages, { relationName: 'recipient' }),
  profilePictureAttachment: one(profilePictureAttachments, { fields: [users.id], references: [profilePictureAttachments.userId] })
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
  submissionHistoryAttachments: many(submissionHistoryAttachments),
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

export const submissionAttachmentsRelations = relations(submissionHistoryAttachments, ({ one }) => ({
  submission: one(submissions, {
    fields: [submissionHistoryAttachments.historyId],
    references: [submissions.id],
  }),
  attachment: one(attachments, {
    fields: [submissionHistoryAttachments.attachmentId],
    references: [attachments.id],
  }),
}));