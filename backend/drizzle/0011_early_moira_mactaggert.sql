DROP INDEX `user_login_master_login_id_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `ux_user_login_master_login_id` ON `user_login_master` (`login_id`) WHERE "user_login_master"."delete_flg" = false;--> statement-breakpoint
DROP INDEX `user_master_name_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `ux_user_master_name` ON `user_master` (`name`) WHERE "user_master"."delete_flg" = false;