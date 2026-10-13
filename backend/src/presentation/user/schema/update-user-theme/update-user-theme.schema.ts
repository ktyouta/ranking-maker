import { z } from "zod";

/**
 * ユーザーテーマ更新リクエストスキーマ
 *
 * 型・構造のみを検証する。テーマの許容値は値オブジェクトで判定する。
 */
export const UpdateUserThemeSchema = z.object({
  theme: z.string(),
});

export type UpdateUserThemeSchemaType = z.infer<typeof UpdateUserThemeSchema>;
