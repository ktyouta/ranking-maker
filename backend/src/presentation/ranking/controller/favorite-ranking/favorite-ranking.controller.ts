import { Hono } from "hono";
import { UpdateFavoriteRankingUsecase } from "../../../../application";
import { API_ENDPOINT, HTTP_STATUS } from "../../../../constant";
import { UserId } from "../../../../domain";
import { UpdateFavoriteRankingRepository } from "../../../../infrastructure";
import { authMiddleware, validatorMiddleware } from "../../../../middleware";
import { RankingIdParamSchema } from "../../../../schema/ranking-id-param/ranking-id-param.schema";
import type { AppEnv } from "../../../../types";
import { UpdateFavoriteRankingSchema } from "../../schema";

/**
 * お気に入り更新（登録・解除）
 */
const favoriteRanking = new Hono<AppEnv>().put(API_ENDPOINT.RANKING_ID_FAVORITE,
  authMiddleware,
  validatorMiddleware("param", RankingIdParamSchema),
  validatorMiddleware("json", UpdateFavoriteRankingSchema),
  async (c) => {
    const db = c.get('db');
    const repository = new UpdateFavoriteRankingRepository(db);
    const user = c.get("user");
    if (!user) {
      return c.json({ message: "認証エラー" }, HTTP_STATUS.UNAUTHORIZED);
    }
    const userId = UserId.of(user.userId.value);
    const { rankingId } = c.req.valid("param");
    const { isFavorite } = c.req.valid("json");
    const usecase = new UpdateFavoriteRankingUsecase(repository);

    const result = await usecase.execute({ userId, rankingId, isFavorite });

    if (result.isErr()) {
      return c.json({ message: "ランキングが存在しません" }, HTTP_STATUS.NOT_FOUND);
    }

    return c.json(
      { message: isFavorite ? "お気に入りに登録しました。" : "お気に入りを解除しました。" },
      HTTP_STATUS.OK,
    );
  });

export { favoriteRanking };
