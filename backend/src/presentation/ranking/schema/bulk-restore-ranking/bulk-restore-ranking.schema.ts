import { z } from "zod";

/**
 * ランキング一括復元対象IDスキーマ
 *
 * 型・構造のみを検証する。ランキングIDとして正しいか・件数の上限は、ユースケースで判定する。
 */
export const BulkRestoreRankingSchema = z.object({
  ids: z.array(z.string()),
});

export type BulkRestoreRankingSchemaType = z.infer<typeof BulkRestoreRankingSchema>;
