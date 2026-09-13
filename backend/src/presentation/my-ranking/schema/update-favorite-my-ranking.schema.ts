import { z } from "zod";

/**
 * お気に入り更新リクエストスキーマ
 */
export const UpdateFavoriteMyRankingSchema = z.object({
  isFavorite: z.boolean(),
});

export type UpdateFavoriteMyRankingSchemaType = z.infer<typeof UpdateFavoriteMyRankingSchema>;
