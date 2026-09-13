import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { UpdateFavoriteMyRankingUsecase } from "../../../application";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { RankingId, UserId } from "../../../domain";
import { UpdateFavoriteMyRankingRepository } from "../../../infrastructure";
import { authMiddleware } from "../../../middleware";
import { RankingIdParamSchema } from "../../../schema/ranking-id-param.schema";
import type { AppEnv } from "../../../types";
import { formatZodErrors } from "../../../util";
import { UpdateFavoriteMyRankingSchema } from "../schema";

/**
 * お気に入り更新（登録・解除）
 */
const favoriteMyRanking = new Hono<AppEnv>().put(API_ENDPOINT.MY_RANKING_ID_FAVORITE,
  authMiddleware,
  zValidator("param", RankingIdParamSchema, (result, c) => {
    if (!result.success) {
      return c.json({ message: result.error.message, data: formatZodErrors(result.error) }, HTTP_STATUS.BAD_REQUEST);
    }
  }),
  zValidator("json", UpdateFavoriteMyRankingSchema, (result, c) => {
    if (!result.success) {
      return c.json({ message: "リクエストが不正です。", data: formatZodErrors(result.error) }, HTTP_STATUS.UNPROCESSABLE_ENTITY);
    }
  }),
  async (c) => {
    const db = c.get('db');
    const repository = new UpdateFavoriteMyRankingRepository(db);
    const user = c.get("user");
    if (!user) {
      return c.json({ message: "認証エラー" }, HTTP_STATUS.UNAUTHORIZED);
    }
    const userId = UserId.of(user.userId.value);
    const rankingId = RankingId.of(c.req.valid("param").rankingId);
    const { isFavorite } = c.req.valid("json");
    const usecase = new UpdateFavoriteMyRankingUsecase(repository);

    const result = await usecase.execute(userId, rankingId, isFavorite);

    if (result.isErr()) {
      return c.json({ message: "ランキングが存在しません" }, HTTP_STATUS.NOT_FOUND);
    }

    return c.json(
      { message: isFavorite ? "お気に入りに登録しました。" : "お気に入りを解除しました。" },
      HTTP_STATUS.OK,
    );
  });

export { favoriteMyRanking };
