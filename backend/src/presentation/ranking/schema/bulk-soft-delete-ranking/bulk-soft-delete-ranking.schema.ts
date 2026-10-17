import { z } from "zod";

/**
 * ランキング一括削除（論理削除）対象IDスキーマ
 *
 * 型・構造のみを検証する。ランキングIDとして正しいか・件数の上限は、ユースケースで判定する。
 */
export const BulkSoftDeleteRankingSchema = z.object({
  ids: z.array(z.string()),
});

export type BulkSoftDeleteRankingSchemaType = z.infer<typeof BulkSoftDeleteRankingSchema>;
