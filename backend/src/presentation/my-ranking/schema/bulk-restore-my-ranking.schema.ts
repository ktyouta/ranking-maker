import { z } from "zod";

// 一度に削除できるランキングの最大件数
const MAX_BULK_DELETE_IDS = 100;

/**
 * ランキング一括削除（論理削除）対象IDスキーマ
 */
export const BulkRestoreMyRankingSchema = z.object({
  ids: z
    .array(z.string().min(1, "ランキングIDが不正です"))
    .min(1, "ランキングを選択してください")
    .max(MAX_BULK_DELETE_IDS, `選択できるランキングは${MAX_BULK_DELETE_IDS}件までです`),
});

export type BulkRestoreMyRankingSchemaType = z.infer<typeof BulkRestoreMyRankingSchema>;
