import { z } from "zod";

// 一度にエクスポートできるランキングの最大件数
const MAX_EXPORT_IDS = 100;

/**
 * ランキングCSVエクスポート対象IDスキーマ
 */
export const GetMyRankingExportSchema = z.object({
  ids: z
    .array(z.string().min(1, "ランキングIDが不正です"))
    .min(1, "ランキングを選択してください")
    .max(MAX_EXPORT_IDS, `選択できるランキングは${MAX_EXPORT_IDS}件までです`),
});

export type GetMyRankingExportSchemaType = z.infer<typeof GetMyRankingExportSchema>;
