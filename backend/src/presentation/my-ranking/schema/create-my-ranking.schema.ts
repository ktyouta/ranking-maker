import { z } from "zod";

/**
 * ランキング作成リクエストスキーマ
 *
 * rankingId はパスパラメータ、userId は認証情報から取得するためボディには含めない。
 */
export const CreateMyRankingSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルは必須です")
    .max(100, "タイトルは100文字以内で入力してください"),
  // 1: 非公開 / 2: 公開（PublicStatus 値オブジェクトと対応）
  publicStatus: z
    .number()
    .int("公開ステータスが不正です")
    .refine((value) => value === 1 || value === 2, "公開ステータスが不正です"),
  memo: z
    .string()
    .max(1000, "メモは1000文字以内で入力してください")
    .default(""),
  items: z
    .array(
      z.object({
        itemName: z
          .string()
          .min(1, "項目名は必須です")
          .max(100, "項目名は100文字以内で入力してください"),
        order: z
          .number()
          .int("順位は整数で入力してください")
          .min(1, "順位は1以上で入力してください"),
        memo: z
          .string()
          .max(1000, "メモは1000文字以内で入力してください")
          .default(""),
      })
    )
    .min(1, "ランキング項目を1件以上入力してください"),
});

export type CreateMyRankingSchemaType = z.infer<typeof CreateMyRankingSchema>;
