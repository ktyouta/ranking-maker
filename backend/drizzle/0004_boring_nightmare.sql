PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_ranking_order_master` (
	`id` text PRIMARY KEY NOT NULL,
	`ranking_id` text NOT NULL,
	`order` integer NOT NULL,
	`item_name` text,
	`item_memo` text,
	`delete_flg` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`ranking_id`) REFERENCES `ranking_master`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_ranking_order_master`("id", "ranking_id", "order", "item_name", "item_memo", "delete_flg", "created_at", "updated_at") SELECT "id", "ranking_id", "order", "item_name", "item_memo", "delete_flg", "created_at", "updated_at" FROM `ranking_order_master`;--> statement-breakpoint
DROP TABLE `ranking_order_master`;--> statement-breakpoint
ALTER TABLE `__new_ranking_order_master` RENAME TO `ranking_order_master`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `ux_ranking_order_master_ranking_order` ON `ranking_order_master` (`ranking_id`,`order`) WHERE "ranking_order_master"."delete_flg" = false;--> statement-breakpoint
CREATE UNIQUE INDEX `ux_ranking_order_master_ranking_item_name` ON `ranking_order_master` (`ranking_id`,`item_name`) WHERE "ranking_order_master"."delete_flg" = false;