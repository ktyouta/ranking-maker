import { z } from "zod";
import { RankingSort } from "../../../domain";

/**
 * ランキング一覧取得クエリパラメータスキーマ
 */
export const GetListMyRankingQuerySchema = z.object({
  keyword: z.string().optional(),
  createdAtFrom: z.string().optional(),
  createdAtTo: z.string().optional(),
  updatedAtFrom: z.string().optional(),
  updatedAtTo: z.string().optional(),
  favoriteOnly: z.string().optional().transform((v) => v === "true"),
  // 許容値は RankingSort 値オブジェクト（RankingSort.VALUES）を単一権威とする
  sort: z.enum(RankingSort.VALUES).default(RankingSort.DEFAULT),
  page: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.coerce.number().int().positive().default(1)
  ),
});

export type GetListMyRankingQuerySchemaType = z.infer<typeof GetListMyRankingQuerySchema>;
