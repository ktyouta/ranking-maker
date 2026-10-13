import { Hono } from "hono";
import { GetRankingUsecase } from "../../../../application";
import { API_ENDPOINT, HTTP_STATUS } from "../../../../constant";
import { GetRankingRepository } from "../../../../infrastructure";
import { validatorMiddleware } from "../../../../middleware";
import { RankingIdParamSchema } from "../../../../schema";
import type { AppEnv } from "../../../../types";

/**
 * ランキング取得（公開ランキング単体）
 * @route GET /api/v1/ranking/:rankingId
 */
const getRanking = new Hono<AppEnv>().get(API_ENDPOINT.RANKING_ID,
  validatorMiddleware("param", RankingIdParamSchema),
  async (c) => {
    const db = c.get('db');
    const repository = new GetRankingRepository(db);
    const usecase = new GetRankingUsecase(repository);
    const { rankingId } = c.req.valid("param");

    const result = await usecase.execute({ rankingId });

    if (!result) {
      return c.json({ message: "ランキングが存在しません" }, HTTP_STATUS.NOT_FOUND);
    }

    return c.json({ message: "ランキングを取得しました。", data: result.value }, HTTP_STATUS.OK);
  });

export { getRanking };
