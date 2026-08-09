import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

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
  memo: text("memo"),
  deleteFlg: integer("delete_flg", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
},
  (table) => [
    unique().on(table.userId, table.title),
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
  itemName: text("item_name").notNull(),
  itemMemo: text("item_memo"),
  deleteFlg: integer("delete_flg", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
},
  (table) => [
    unique().on(table.rankingId, table.order),
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