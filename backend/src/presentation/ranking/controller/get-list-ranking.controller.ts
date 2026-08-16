import { Hono } from "hono";
import { GetListRankingUsecase } from "../../../application";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { GetListRankingRepository } from "../../../infrastructure";
import type { AppEnv } from "../../../types";

/**
 * ランキング一覧取得
 * @route GET /api/v1/ranking
 */
const getListRanking = new Hono<AppEnv>().get(API_ENDPOINT.RANKING, async (c) => {
  const db = c.get('db');
  const repository = new GetListRankingRepository(db);
  const usecase = new GetListRankingUsecase(repository);

  const result = await usecase.execute();

  return c.json({ message: "ランキング一覧を取得しました。", data: result }, HTTP_STATUS.OK);
});

export { getListRanking };
