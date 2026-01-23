ALTER TABLE `courses_members` ADD `is_approved` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `first_name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `last_name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `name`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `profile_picture`;