CREATE TABLE `attachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`uploader_id` int NOT NULL,
	`path` varchar(512) NOT NULL,
	`uploaded_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `attachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `background_attachments` (
	`course_id` int NOT NULL,
	`attachment_id` int NOT NULL
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`invitation_code` varchar(9) NOT NULL,
	CONSTRAINT `courses_id` PRIMARY KEY(`id`),
	CONSTRAINT `courses_invitation_code_unique` UNIQUE(`invitation_code`)
);
--> statement-breakpoint
CREATE TABLE `courses_members` (
	`course_id` int NOT NULL,
	`user_id` int NOT NULL,
	`is_teacher` boolean NOT NULL DEFAULT false
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`post_id` int NOT NULL,
	`sender_id` int NOT NULL,
	`content` varchar(2048) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `post_attachments` (
	`post_id` int NOT NULL,
	`attachment_id` int NOT NULL
);
--> statement-breakpoint
CREATE TABLE `post_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`post_id` int NOT NULL,
	`sender_id` int NOT NULL,
	`recipient_id` int NOT NULL,
	`max_score` int,
	`message` varchar(2048) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `post_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `post_types` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	CONSTRAINT `post_types_id` PRIMARY KEY(`id`),
	CONSTRAINT `post_types_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`course_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(1024),
	`post_type_id` int NOT NULL,
	`is_edited` boolean NOT NULL DEFAULT false,
	`deadline_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `submission_attachments` (
	`submission_id` int NOT NULL,
	`attachment_id` int NOT NULL
);
--> statement-breakpoint
CREATE TABLE `submission_histories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`submission_id` int NOT NULL,
	`version_number` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `submission_histories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `submission_statuses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	CONSTRAINT `submission_statuses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`post_id` int NOT NULL,
	`user_id` int NOT NULL,
	`status_id` int NOT NULL,
	`last_history_id` int,
	`score` int,
	`submitted_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profile_picture_attachments` (
	`user_id` int NOT NULL,
	`attachment_id` int NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`profile_picture` varchar(512),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `attachments` ADD CONSTRAINT `attachments_uploader_id_users_id_fk` FOREIGN KEY (`uploader_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `background_attachments` ADD CONSTRAINT `background_attachments_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `background_attachments` ADD CONSTRAINT `background_attachments_attachment_id_attachments_id_fk` FOREIGN KEY (`attachment_id`) REFERENCES `attachments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `courses_members` ADD CONSTRAINT `courses_members_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `courses_members` ADD CONSTRAINT `courses_members_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_post_id_posts_id_fk` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_sender_id_users_id_fk` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `post_attachments` ADD CONSTRAINT `post_attachments_post_id_posts_id_fk` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `post_attachments` ADD CONSTRAINT `post_attachments_attachment_id_attachments_id_fk` FOREIGN KEY (`attachment_id`) REFERENCES `attachments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `post_messages` ADD CONSTRAINT `post_messages_post_id_posts_id_fk` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `post_messages` ADD CONSTRAINT `post_messages_sender_id_users_id_fk` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `post_messages` ADD CONSTRAINT `post_messages_recipient_id_users_id_fk` FOREIGN KEY (`recipient_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `posts` ADD CONSTRAINT `posts_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `posts` ADD CONSTRAINT `posts_post_type_id_post_types_id_fk` FOREIGN KEY (`post_type_id`) REFERENCES `post_types`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `submission_attachments` ADD CONSTRAINT `submission_attachments_submission_id_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `submission_attachments` ADD CONSTRAINT `submission_attachments_attachment_id_attachments_id_fk` FOREIGN KEY (`attachment_id`) REFERENCES `attachments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `submission_histories` ADD CONSTRAINT `submission_histories_submission_id_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_post_id_posts_id_fk` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_status_id_submission_statuses_id_fk` FOREIGN KEY (`status_id`) REFERENCES `submission_statuses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `profile_picture_attachments` ADD CONSTRAINT `profile_picture_attachments_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `profile_picture_attachments` ADD CONSTRAINT `profile_picture_attachments_attachment_id_attachments_id_fk` FOREIGN KEY (`attachment_id`) REFERENCES `attachments`(`id`) ON DELETE no action ON UPDATE no action;