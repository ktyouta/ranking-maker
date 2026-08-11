import { z } from "zod";
import { ItemMemo, ItemName, PUBLIC_STATUS_VALUES, RankingMemo, RankingTitle } from "../../../domain";

/**
 * ランキング更新リクエストスキーマ
 *
 * rankingId はパスパラメータ、userId は認証情報から取得するためボディには含めない。
 */
export const UpdateMyRankingSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルは必須です")
    .max(RankingTitle.MAX_LENGTH, `タイトルは${RankingTitle.MAX_LENGTH}文字以内で入力してください`),
  // 許容値は PublicStatus 値オブジェクト（PUBLIC_STATUS_VALUES）を単一権威とする
  publicStatus: z
    .number()
    .int("公開ステータスが不正です")
    .refine((value) => PUBLIC_STATUS_VALUES.includes(value), "公開ステータスが不正です"),
  memo: z
    .string()
    .max(RankingMemo.MAX_LENGTH, `メモは${RankingMemo.MAX_LENGTH}文字以内で入力してください`)
    .default(""),
  items: z
    .array(
      z.object({
        itemName: z
          .string()
          .min(1, "項目名は必須です")
          .max(ItemName.MAX_LENGTH, `項目名は${ItemName.MAX_LENGTH}文字以内で入力してください`),
        order: z
          .number()
          .int("順位は整数で入力してください")
          .min(1, "順位は1以上で入力してください"),
        memo: z
          .string()
          .max(ItemMemo.MAX_LENGTH, `メモは${ItemMemo.MAX_LENGTH}文字以内で入力してください`)
          .default(""),
      })
    )
    .min(1, "ランキング項目を1件以上入力してください"),
});

export type UpdateMyRankingSchemaType = z.infer<typeof UpdateMyRankingSchema>;
