PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_master` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`birthday` text NOT NULL,
	`last_login_date` text,
	`theme` text DEFAULT 'lavender' NOT NULL,
	`delete_flg` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_user_master`("id", "name", "birthday", "last_login_date", "theme", "delete_flg", "created_at", "updated_at") SELECT "id", "name", "birthday", "last_login_date", "theme", "delete_flg", "created_at", "updated_at" FROM `user_master`;--> statement-breakpoint
DROP TABLE `user_master`;--> statement-breakpoint
ALTER TABLE `__new_user_master` RENAME TO `user_master`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `ux_user_master_name` ON `user_master` (`name`) WHERE "user_master"."delete_flg" = false;