import { z } from "zod";

/**
 * ゴミ箱のランキング一覧取得クエリパラメータスキーマ
 *
 * updatedAtFrom/updatedAtTo は「削除日」の範囲指定に使う
 * （ゴミ箱内では論理削除時に更新される updatedAt を削除日時として転用しているため）。
 */
export const GetTrashListMyRankingQuerySchema = z.object({
  title: z.string().optional(),
  createdAtFrom: z.string().optional(),
  createdAtTo: z.string().optional(),
  updatedAtFrom: z.string().optional(),
  updatedAtTo: z.string().optional(),
  page: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.coerce.number().int().positive().default(1)
  ),
});

export type GetTrashListMyRankingQuerySchemaType = z.infer<typeof GetTrashListMyRankingQuerySchema>;
