import { z } from "zod";
import { ItemMemo, ItemName, PublicStatus, RankingMemo, RankingTitle, TagName } from "../../../domain";

/**
 * ランキング作成リクエストスキーマ
 *
 * rankingId はパスパラメータ、userId は認証情報から取得するためボディには含めない。
 */
export const CreateMyRankingSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルは必須です")
    .max(RankingTitle.MAX_LENGTH, `タイトルは${RankingTitle.MAX_LENGTH}文字以内で入力してください`),
  // 許容値は PublicStatus 値オブジェクト（PublicStatus.VALUES）を単一権威とする
  publicStatus: z
    .number()
    .int("公開ステータスが不正です")
    .refine((value) => PublicStatus.VALUES.includes(value), "公開ステータスが不正です"),
  // 実在確認・有効性確認はUsecase層（IconValidityDomainService）で行うため、ここでは構造チェックのみ
  icon: z
    .number()
    .int("アイコンIDが不正です")
    .min(1, "アイコンIDが不正です"),
  memo: z
    .string()
    .max(RankingMemo.MAX_LENGTH, `メモは${RankingMemo.MAX_LENGTH}文字以内で入力してください`)
    .default(""),
  items: z
    .array(
      z.object({
        itemName: z
          .string()
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
    ),
  tags: z
    .array(
      z
        .string()
        .trim()
        .min(1, "タグは必須です")
        .max(TagName.MAX_LENGTH, `タグは${TagName.MAX_LENGTH}文字以内で入力してください`)
    )
});

export type CreateMyRankingSchemaType = z.infer<typeof CreateMyRankingSchema>;
