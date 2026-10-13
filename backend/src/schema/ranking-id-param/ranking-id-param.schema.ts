import { z } from "zod";

/**
 * ランキングIDパラメータスキーマ
 *
 * 型のみを検証する。空のランキングIDはルーティングで一致しないため届かない。存在しないランキングIDは、ランキングの取得で見つからないため 404 になる。
 */
export const RankingIdParamSchema = z.object({
  rankingId: z.string(),
});

export type RankingIdParamSchemaType = z.infer<typeof RankingIdParamSchema>;
