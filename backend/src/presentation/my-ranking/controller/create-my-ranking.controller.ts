import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { CreateMyRankingUsecase } from "../../../application/my-ranking/usecase/create-my-ranking.usecase";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { RankingId, UserId } from "../../../domain";
import { CreateMyRankingRepository } from "../../../infrastructure/my-ranking/repository/create-my-ranking.repository";
import { authMiddleware } from "../../../middleware";
import { RankingIdParamSchema } from "../../../schema";
import type { AppEnv } from "../../../types";
import { formatZodErrors } from "../../../util";

/**
 * ランキング作成
 */
const createMyRanking = new Hono<AppEnv>().post(API_ENDPOINT.MY_RANKING,
  authMiddleware,
  zValidator("param", RankingIdParamSchema, (result, c) => {
    if (!result.success) {
      return c.json({ message: result.error.message, data: formatZodErrors(result.error) }, HTTP_STATUS.BAD_REQUEST);
    }
  }),
  async (c) => {
    const db = c.get('db');
    const user = c.get("user");
    if (!user) {
      return c.json({ message: "認証エラー" }, HTTP_STATUS.UNAUTHORIZED);
    }
    const userId = UserId.of(user.userId.value);
    const rankingId = RankingId.of(c.req.valid("param").rankingId);
    const repository = new CreateMyRankingRepository(db);
    const service = new CreateMyRankingUsecase(repository);

    const result = service.execute(userId, rankingId);

    return c.json({ message: "ランキングを作成しました。", data: [] }, HTTP_STATUS.OK);
  });

export { createMyRanking };
