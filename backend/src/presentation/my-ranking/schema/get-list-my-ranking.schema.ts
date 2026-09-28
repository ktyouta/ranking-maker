import { z } from "zod";
import { RankingAggregate, RankingSort, TagName } from "../../../domain";

/**
 * ランキング一覧取得クエリパラメータスキーマ
 */
export const GetListMyRankingQuerySchema = z.object({
  keyword: z.string().optional(),
  createdAtFrom: z.string().optional(),
  createdAtTo: z.string().optional(),
  updatedAtFrom: z.string().optional(),
  updatedAtTo: z.string().optional(),
  favoriteOnly: z.string().optional().transform((v) => v === "true"),
  // 複数のタグ名を区切り文字でつないだ1つの文字列で受け取る（例: "ラーメン,東京"）
  tags: z
    .string()
    .optional()
    .transform((v) => (v ? v.split(TagName.SEPARATOR) : []))
    .pipe(
      z
        .array(
          z
            .string()
            .trim()
            .min(1, "タグは必須です")
            .max(TagName.MAX_LENGTH, `タグは${TagName.MAX_LENGTH}文字以内で入力してください`)
        )
        // 1ランキングに付けられるタグの上限を超えて指定しても必ず0件になるため、同じ上限で制限する
        .max(RankingAggregate.MAX_TAG_COUNT, `タグは${RankingAggregate.MAX_TAG_COUNT}個までです`)
    ),
  // 許容値は RankingSort 値オブジェクト（RankingSort.VALUES）を単一権威とする
  sort: z.enum(RankingSort.VALUES).default(RankingSort.DEFAULT),
  page: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.coerce.number().int().positive().default(1)
  ),
});

export type GetListMyRankingQuerySchemaType = z.infer<typeof GetListMyRankingQuerySchema>;
