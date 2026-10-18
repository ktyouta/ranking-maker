-- user_master を作り直すと、参照している子孫テーブルの行が ON DELETE CASCADE で削除される。
-- D1 のマイグレーションでは PRAGMA foreign_keys=OFF が効かないため、子孫テーブルを退避してから作り直し、作り直した後に戻す。
CREATE TABLE `__bak_user_login_master` AS SELECT * FROM `user_login_master`;--> statement-breakpoint
CREATE TABLE `__bak_user_google_login_master` AS SELECT * FROM `user_google_login_master`;--> statement-breakpoint
CREATE TABLE `__bak_tag_master` AS SELECT * FROM `tag_master`;--> statement-breakpoint
CREATE TABLE `__bak_ranking_master` AS SELECT * FROM `ranking_master`;--> statement-breakpoint
CREATE TABLE `__bak_ranking_order_master` AS SELECT * FROM `ranking_order_master`;--> statement-breakpoint
CREATE TABLE `__bak_ranking_tag_master` AS SELECT * FROM `ranking_tag_master`;--> statement-breakpoint
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
CREATE UNIQUE INDEX `ux_user_master_name` ON `user_master` (`name`) WHERE "user_master"."delete_flg" = false;--> statement-breakpoint
-- CASCADE が実行されなかった場合も同じ結果になるよう、子孫テーブルを空にしてから退避した行を戻す
DELETE FROM `ranking_tag_master`;--> statement-breakpoint
DELETE FROM `ranking_order_master`;--> statement-breakpoint
DELETE FROM `ranking_master`;--> statement-breakpoint
DELETE FROM `tag_master`;--> statement-breakpoint
DELETE FROM `user_google_login_master`;--> statement-breakpoint
DELETE FROM `user_login_master`;--> statement-breakpoint
INSERT INTO `user_login_master` SELECT * FROM `__bak_user_login_master`;--> statement-breakpoint
INSERT INTO `user_google_login_master` SELECT * FROM `__bak_user_google_login_master`;--> statement-breakpoint
INSERT INTO `tag_master` SELECT * FROM `__bak_tag_master`;--> statement-breakpoint
INSERT INTO `ranking_master` SELECT * FROM `__bak_ranking_master`;--> statement-breakpoint
INSERT INTO `ranking_order_master` SELECT * FROM `__bak_ranking_order_master`;--> statement-breakpoint
INSERT INTO `ranking_tag_master` SELECT * FROM `__bak_ranking_tag_master`;--> statement-breakpoint
DROP TABLE `__bak_user_login_master`;--> statement-breakpoint
DROP TABLE `__bak_user_google_login_master`;--> statement-breakpoint
DROP TABLE `__bak_tag_master`;--> statement-breakpoint
DROP TABLE `__bak_ranking_master`;--> statement-breakpoint
DROP TABLE `__bak_ranking_order_master`;--> statement-breakpoint
DROP TABLE `__bak_ranking_tag_master`;
