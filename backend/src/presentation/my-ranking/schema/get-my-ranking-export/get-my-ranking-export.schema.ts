import { z } from "zod";

/**
 * ランキングCSVエクスポート対象IDスキーマ
 *
 * 型・構造のみを検証する。ランキングIDとして正しいか・件数の上限は、ユースケースで判定する。
 */
export const GetMyRankingExportSchema = z.object({
  ids: z.array(z.string()),
});

export type GetMyRankingExportSchemaType = z.infer<typeof GetMyRankingExportSchema>;
