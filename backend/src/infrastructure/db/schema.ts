import { sql } from "drizzle-orm";
import { foreignKey, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

/**
 * サンプルテーブル
 */
export const sample = sqliteTable("sample", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  deleteFlg: integer("delete_flg", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export type Sample = typeof sample.$inferSelect;
export type NewSample = typeof sample.$inferInsert;

/**
 * ユーザーマスタ
 */
export const userMaster = sqliteTable("user_master", {
  id: text("id").primaryKey(), // ULID
  name: text("name").notNull().unique(),
  birthday: text("birthday"),
  lastLoginDate: text("last_login_date"),
  theme: text("theme").notNull().default("lavender"),
  deleteFlg: integer("delete_flg", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export type UserMaster = typeof userMaster.$inferSelect;
export type NewUserMaster = typeof userMaster.$inferInsert;

/**
 * ユーザーログインマスタ
 */
export const userLoginMaster = sqliteTable("user_login_master", {
  id: text("id").primaryKey(), // ULID（ログインレコード自身のID）
  userId: text("user_id").notNull().references(() => userMaster.id, { onDelete: "cascade" }),
  loginId: text("login_id").notNull().unique(),
  passwordHash: text("password_hash"),
  salt: text("salt"),
  authProvider: text("auth_provider").notNull().default("password"),
  googleId: text("google_id"),
  deleteFlg: integer("delete_flg", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export type UserLoginMaster = typeof userLoginMaster.$inferSelect;
export type NewUserLoginMaster = typeof userLoginMaster.$inferInsert;


/**
 * ランキングマスタ
 */
export const rankingMaster = sqliteTable("ranking_master", {
  id: text("id").primaryKey(), // ULID
  userId: text("user_id").notNull().references(() => userMaster.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  publicStatus: integer("public_status").notNull().references(() => publicStatusMaster.id, { onDelete: "restrict" }),
  icon: integer("icon").notNull().default(1).references(() => iconMaster.id, { onDelete: "restrict" }),
  memo: text("memo"),
  isFavorite: integer("is_favorite", { mode: "boolean" }).notNull().default(false),
  deleteFlg: integer("delete_flg", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
},
  (table) => [
    // 論理削除された行は一意判定の対象外とし、生存行のみで (userId, title) を一意にする
    uniqueIndex("ux_ranking_master_user_title")
      .on(table.userId, table.title)
      .where(sql`${table.deleteFlg} = false`),
    // ranking_tag_master の複合外部キー (rankingId, userId) の参照先として必要な一意制約
    uniqueIndex("ux_ranking_master_id_user").on(table.id, table.userId),
  ]);

export type RankingMaster = typeof rankingMaster.$inferSelect;
export type NewRankingMaster = typeof rankingMaster.$inferInsert;


/**
 * ランキングオーダーマスタ
 */
export const rankingOrderMaster = sqliteTable("ranking_order_master", {
  id: text("id").primaryKey(), // ULID
  rankingId: text("ranking_id").notNull().references(() => rankingMaster.id, { onDelete: "cascade" }),
  order: integer("order").notNull(),
  itemName: text("item_name"),
  itemMemo: text("item_memo"),
  deleteFlg: integer("delete_flg", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
},
  (table) => [
    // 論理削除された行は一意判定の対象外とし、生存行のみで (rankingId, order) を一意にする
    uniqueIndex("ux_ranking_order_master_ranking_order")
      .on(table.rankingId, table.order)
      .where(sql`${table.deleteFlg} = false`),
    // 論理削除された行は一意判定の対象外とし、生存行のみで (rankingId, itemName) を一意にする
    uniqueIndex("ux_ranking_order_master_ranking_item_name")
      .on(table.rankingId, table.itemName)
      .where(sql`${table.deleteFlg} = false`),
  ]);

export type RankingOrderMaster = typeof rankingOrderMaster.$inferSelect;
export type NewRankingOrderMaster = typeof rankingOrderMaster.$inferInsert;


/**
 * 公開設定マスタ
 */
export const publicStatusMaster = sqliteTable("public_status_master", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  deleteFlg: integer("delete_flg", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

/**
 * アイコンマスタ
 */
export const iconMaster = sqliteTable("icon_master", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  emoji: text("emoji").notNull(),
  deleteFlg: integer("delete_flg", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export type IconMaster = typeof iconMaster.$inferSelect;
export type NewIconMaster = typeof iconMaster.$inferInsert;


/**
 * タグマスタ
 */
export const tagMaster = sqliteTable("tag_master", {
  id: text("id").primaryKey(), // ULID
  userId: text("user_id").notNull().references(() => userMaster.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  deleteFlg: integer("delete_flg", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
},
  (table) => [
    // 論理削除された行は一意判定の対象外とし、生存行のみで (userId, name) を一意にする
    uniqueIndex("ux_tag_master_user_name")
      .on(table.userId, table.name)
      .where(sql`${table.deleteFlg} = false`),
    // ranking_tag_master の複合外部キー (tagId, userId) の参照先として必要な一意制約
    uniqueIndex("ux_tag_master_id_user").on(table.id, table.userId),
  ]);

export type TagMaster = typeof tagMaster.$inferSelect;
export type NewTagMaster = typeof tagMaster.$inferInsert;


/**
 * ランキングタグマスタ（ランキングとタグの中間テーブル）
 *
 * rankingId・tagId は userId との複合外部キーで参照する。これにより
 * 「自分が所有するランキングに、自分が所有するタグしか設定できない」
 * という不変条件をDB制約として担保する（単純な単一列FKでは表現できない）。
 */
export const rankingTagMaster = sqliteTable("ranking_tag_master", {
  id: text("id").primaryKey(), // ULID
  rankingId: text("ranking_id").notNull(),
  tagId: text("tag_id").notNull(),
  userId: text("user_id").notNull(),
  deleteFlg: integer("delete_flg", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
},
  (table) => [
    // 論理削除された行は一意判定の対象外とし、生存行のみで (rankingId, tagId) を一意にする
    uniqueIndex("ux_ranking_tag_master_ranking_tag")
      .on(table.rankingId, table.tagId)
      .where(sql`${table.deleteFlg} = false`),
    // rankingId が userId 本人の所有するランキングであることをDB制約として担保する
    foreignKey({
      columns: [table.rankingId, table.userId],
      foreignColumns: [rankingMaster.id, rankingMaster.userId],
      name: "fk_ranking_tag_master_ranking_user",
    }).onDelete("cascade"),
    // tagId が userId 本人の所有するタグであることをDB制約として担保する
    foreignKey({
      columns: [table.tagId, table.userId],
      foreignColumns: [tagMaster.id, tagMaster.userId],
      name: "fk_ranking_tag_master_tag_user",
    }).onDelete("cascade"),
  ]);

export type RankingTagMaster = typeof rankingTagMaster.$inferSelect;
export type NewRankingTagMaster = typeof rankingTagMaster.$inferInsert;