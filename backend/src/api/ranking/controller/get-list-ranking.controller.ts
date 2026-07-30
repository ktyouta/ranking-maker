import { Hono } from "hono";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import type { AppEnv } from "../../../types";
import { GetListRankingRepository } from "../repository";
import { GetListRankingService } from "../service/get-list-ranking.service";

/**
 * ランキング一覧取得
 * @route GET /api/v1/ranking
 */
const getListRanking = new Hono<AppEnv>().get(API_ENDPOINT.RANKING, async (c) => {
  const db = c.get('db');
  const repository = new GetListRankingRepository(db);
  const service = new GetListRankingService(repository);

  const result = await service.findAll();

  return c.json({ message: "ランキング一覧を取得しました。", data: result }, HTTP_STATUS.OK);
});

export { getListRanking };

