import { Hono } from "hono";
import { GetMyRankingUsecase } from "../../../../application";
import { API_ENDPOINT, HTTP_STATUS } from "../../../../constant";
import { UserId } from "../../../../domain";
import { GetMyRankingRepository } from "../../../../infrastructure";
import { authMiddleware, validatorMiddleware } from "../../../../middleware";
import { RankingIdParamSchema } from "../../../../schema/ranking-id-param/ranking-id-param.schema";
import type { AppEnv } from "../../../../types";

/**
 * ランキング取得
 */
const getMyRanking = new Hono<AppEnv>().get(API_ENDPOINT.MY_RANKING_ID,
  authMiddleware,
  validatorMiddleware("param", RankingIdParamSchema),
  async (c) => {
    const db = c.get('db');
    const repository = new GetMyRankingRepository(db);
    const user = c.get("user");
    if (!user) {
      return c.json({ message: "認証エラー" }, HTTP_STATUS.UNAUTHORIZED);
    }
    const userId = UserId.of(user.userId.value);
    const { rankingId } = c.req.valid("param");
    const usecase = new GetMyRankingUsecase(repository);

    const result = await usecase.execute({ userId, rankingId });

    if (!result) {
      return c.json({ message: "ランキングが存在しません" }, HTTP_STATUS.NOT_FOUND);
    }

    return c.json({ message: "ランキングを取得しました。", data: result.value }, HTTP_STATUS.OK);
  });

export { getMyRanking };
