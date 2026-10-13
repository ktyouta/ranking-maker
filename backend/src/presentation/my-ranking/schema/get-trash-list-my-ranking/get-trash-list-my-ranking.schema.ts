import { z } from "zod";
import { TagName } from "../../../../domain";

/**
 * ゴミ箱のランキング一覧取得クエリパラメータスキーマ
 *
 * updatedAtFrom/updatedAtTo は「削除日」の範囲指定に使う
 * （ゴミ箱内では論理削除時に更新される updatedAt を削除日時として転用しているため）。
 *
 * クエリは文字列で届くため、型の変換のみを行う。
 * タグ名・並び順・ページ番号として正しいか（省略時の既定値を含む）は値オブジェクトで判定する。
 */
export const GetTrashListMyRankingQuerySchema = z.object({
  keyword: z.string().optional(),
  createdAtFrom: z.string().optional(),
  createdAtTo: z.string().optional(),
  updatedAtFrom: z.string().optional(),
  updatedAtTo: z.string().optional(),
  // 複数のタグ名を区切り文字でつないだ1つの文字列で受け取る（例: "ラーメン,東京"）
  tags: z.string().optional().transform((v) => (v ? v.split(TagName.SEPARATOR) : [])),
  sort: z.string().optional(),
  // 空文字（page=）は省略と同じ扱いにする
  page: z.string().optional().transform((v) => (v ? Number(v) : undefined)),
});

export type GetTrashListMyRankingQuerySchemaType = z.infer<typeof GetTrashListMyRankingQuerySchema>;
