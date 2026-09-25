CREATE TABLE `ranking_tag_master` (
	`id` text PRIMARY KEY NOT NULL,
	`ranking_id` text NOT NULL,
	`tag_id` text NOT NULL,
	`user_id` text NOT NULL,
	`delete_flg` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`ranking_id`,`user_id`) REFERENCES `ranking_master`(`id`,`user_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`,`user_id`) REFERENCES `tag_master`(`id`,`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ux_ranking_tag_master_ranking_tag` ON `ranking_tag_master` (`ranking_id`,`tag_id`) WHERE "ranking_tag_master"."delete_flg" = false;--> statement-breakpoint
CREATE TABLE `tag_master` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`delete_flg` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user_master`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ux_tag_master_user_name` ON `tag_master` (`user_id`,`name`) WHERE "tag_master"."delete_flg" = false;--> statement-breakpoint
CREATE UNIQUE INDEX `ux_tag_master_id_user` ON `tag_master` (`id`,`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `ux_ranking_master_id_user` ON `ranking_master` (`id`,`user_id`);