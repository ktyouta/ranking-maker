import { z } from "zod";

/**
 * ランキングIDパラメータスキーマ
 */
export const RankingIdParamSchema = z.object({
  rankingId: z.string().min(1, "ランキングIDを指定してください"),
});

export type RankingIdParamSchemaType = z.infer<typeof RankingIdParamSchema>;
