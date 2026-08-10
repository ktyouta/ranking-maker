CREATE TABLE `public_status_master` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`delete_flg` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `public_status_master_name_unique` ON `public_status_master` (`name`);--> statement-breakpoint
CREATE TABLE `ranking_master` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`public_status` integer NOT NULL,
	`memo` text,
	`delete_flg` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user_master`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`public_status`) REFERENCES `public_status_master`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ux_ranking_master_user_title` ON `ranking_master` (`user_id`,`title`) WHERE "ranking_master"."delete_flg" = false;--> statement-breakpoint
CREATE TABLE `ranking_order_master` (
	`id` text PRIMARY KEY NOT NULL,
	`ranking_id` text NOT NULL,
	`order` integer NOT NULL,
	`item_name` text NOT NULL,
	`item_memo` text,
	`delete_flg` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`ranking_id`) REFERENCES `ranking_master`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ux_ranking_order_master_ranking_order` ON `ranking_order_master` (`ranking_id`,`order`) WHERE "ranking_order_master"."delete_flg" = false;--> statement-breakpoint
CREATE TABLE `sample` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`delete_flg` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_login_master` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`login_id` text NOT NULL,
	`password_hash` text,
	`salt` text,
	`auth_provider` text DEFAULT 'password' NOT NULL,
	`google_id` text,
	`delete_flg` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user_master`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_user_login_master`("id", "user_id", "login_id", "password_hash", "salt", "auth_provider", "google_id", "delete_flg", "created_at", "updated_at") SELECT "id", "user_id", "login_id", "password_hash", "salt", "auth_provider", "google_id", "delete_flg", "created_at", "updated_at" FROM `user_login_master`;--> statement-breakpoint
DROP TABLE `user_login_master`;--> statement-breakpoint
ALTER TABLE `__new_user_login_master` RENAME TO `user_login_master`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `user_login_master_login_id_unique` ON `user_login_master` (`login_id`);--> statement-breakpoint
CREATE TABLE `__new_user_master` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`birthday` text,
	`last_login_date` text,
	`delete_flg` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_user_master`("id", "name", "birthday", "last_login_date", "delete_flg", "created_at", "updated_at") SELECT "id", "name", "birthday", "last_login_date", "delete_flg", "created_at", "updated_at" FROM `user_master`;--> statement-breakpoint
DROP TABLE `user_master`;--> statement-breakpoint
ALTER TABLE `__new_user_master` RENAME TO `user_master`;--> statement-breakpoint
CREATE UNIQUE INDEX `user_master_name_unique` ON `user_master` (`name`);