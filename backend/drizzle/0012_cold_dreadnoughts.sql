CREATE TABLE `user_google_login_master` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`google_id` text NOT NULL,
	`delete_flg` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user_master`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ux_user_google_login_master_google_id` ON `user_google_login_master` (`google_id`) WHERE "user_google_login_master"."delete_flg" = false;--> statement-breakpoint
CREATE UNIQUE INDEX `ux_user_google_login_master_user_id` ON `user_google_login_master` (`user_id`) WHERE "user_google_login_master"."delete_flg" = false;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_login_master` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`login_id` text NOT NULL,
	`password_hash` text NOT NULL,
	`salt` text NOT NULL,
	`delete_flg` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user_master`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_user_login_master`("id", "user_id", "login_id", "password_hash", "salt", "delete_flg", "created_at", "updated_at") SELECT "id", "user_id", "login_id", "password_hash", "salt", "delete_flg", "created_at", "updated_at" FROM `user_login_master`;--> statement-breakpoint
DROP TABLE `user_login_master`;--> statement-breakpoint
ALTER TABLE `__new_user_login_master` RENAME TO `user_login_master`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `ux_user_login_master_login_id` ON `user_login_master` (`login_id`) WHERE "user_login_master"."delete_flg" = false;--> statement-breakpoint
CREATE UNIQUE INDEX `ux_user_login_master_user_id` ON `user_login_master` (`user_id`) WHERE "user_login_master"."delete_flg" = false;