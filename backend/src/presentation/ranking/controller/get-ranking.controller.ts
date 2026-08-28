import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { GetRankingUsecase } from "../../../application";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { RankingId } from "../../../domain";
import { GetRankingRepository } from "../../../infrastructure";
import { RankingIdParamSchema } from "../../../schema";
import type { AppEnv } from "../../../types";
import { formatZodErrors } from "../../../util";

/**
 * ランキング取得（公開ランキング単体）
 * @route GET /api/v1/ranking/:rankingId
 */
const getRanking = new Hono<AppEnv>().get(API_ENDPOINT.RANKING_ID,
  zValidator("param", RankingIdParamSchema, (result, c) => {
    if (!result.success) {
      return c.json({ message: result.error.message, data: formatZodErrors(result.error) }, HTTP_STATUS.BAD_REQUEST);
    }
  }),
  async (c) => {
    const db = c.get('db');
    const repository = new GetRankingRepository(db);
    const usecase = new GetRankingUsecase(repository);
    const rankingId = RankingId.of(c.req.valid("param").rankingId);

    const result = await usecase.execute(rankingId);

    if (!result) {
      return c.json({ message: "ランキングが存在しません" }, HTTP_STATUS.NOT_FOUND);
    }

    return c.json({ message: "ランキングを取得しました。", data: result }, HTTP_STATUS.OK);
  });

export { getRanking };
