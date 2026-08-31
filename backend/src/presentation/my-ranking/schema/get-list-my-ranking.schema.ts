import { z } from "zod";

/**
 * ランキング一覧取得クエリパラメータスキーマ
 */
export const GetListMyRankingQuerySchema = z.object({
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

export type GetListMyRankingQuerySchemaType = z.infer<typeof GetListMyRankingQuerySchema>;
