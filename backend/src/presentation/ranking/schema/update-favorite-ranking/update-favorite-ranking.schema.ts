import { z } from "zod";

/**
 * お気に入り更新リクエストスキーマ
 */
export const UpdateFavoriteRankingSchema = z.object({
  isFavorite: z.boolean(),
});

export type UpdateFavoriteRankingSchemaType = z.infer<typeof UpdateFavoriteRankingSchema>;
