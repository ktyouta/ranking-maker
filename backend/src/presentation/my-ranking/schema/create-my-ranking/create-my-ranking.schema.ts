import { z } from "zod";

/**
 * ランキング作成リクエストスキーマ
 *
 * rankingId はパスパラメータ、userId は認証情報から取得するためボディには含めない。
 * 型・構造のみを検証する。値の制約（文字数・許容値等）は値オブジェクト、
 * 重複・タグ数の上限は集約（RankingAggregate）で判定する。
 */
export const CreateMyRankingSchema = z.object({
  title: z.string(),
  publicStatus: z.number(),
  icon: z.number(),
  memo: z.string().default(""),
  items: z.array(
    z.object({
      itemName: z.string(),
      order: z.number(),
      memo: z.string().default(""),
    })
  ),
  tags: z.array(z.string()),
});

export type CreateMyRankingSchemaType = z.infer<typeof CreateMyRankingSchema>;
