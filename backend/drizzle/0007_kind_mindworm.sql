-- icon_master のテーブル作成・22件のシード投入は 0006_icon-master-seed.sql で完了済みのため、
-- ここでは ranking_master 側の変更のみ行う。
-- SQLiteは「REFERENCES列にNOT NULLのDEFAULT値を同時指定するADD COLUMN」を許可しないため、
-- 0002_far_silver_samurai.sql と同じ「テーブル再作成方式」で icon 列（NOT NULL + FK）を追加する。
-- 既存行は icon = 1（🏆、0006で投入済み）でバックフィルする。
-- foreign_keys を OFF にしないと、DROP TABLE ranking_master が ranking_order_master.ranking_id の
-- ON DELETE CASCADE を発火させ、紐づく項目データを全て消してしまう（0002と同じ理由でOFF/ONを挟む）。
PRAGMA foreign_keys=OFF;
--> statement-breakpoint
CREATE TABLE `__new_ranking_master` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`public_status` integer NOT NULL,
	`icon` integer DEFAULT 1 NOT NULL,
	`memo` text,
	`delete_flg` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user_master`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`public_status`) REFERENCES `public_status_master`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`icon`) REFERENCES `icon_master`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `__new_ranking_master`("id", "user_id", "title", "public_status", "icon", "memo", "delete_flg", "created_at", "updated_at")
SELECT "id", "user_id", "title", "public_status", 1, "memo", "delete_flg", "created_at", "updated_at" FROM `ranking_master`;
--> statement-breakpoint
DROP TABLE `ranking_master`;
--> statement-breakpoint
ALTER TABLE `__new_ranking_master` RENAME TO `ranking_master`;
--> statement-breakpoint
CREATE UNIQUE INDEX `ux_ranking_master_user_title` ON `ranking_master` (`user_id`,`title`) WHERE "ranking_master"."delete_flg" = false;
--> statement-breakpoint
PRAGMA foreign_keys=ON;
