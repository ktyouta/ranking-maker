import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { GetTrashMyRankingUsecase } from "../../../application";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { RankingId, UserId } from "../../../domain";
import { GetTrashMyRankingRepository } from "../../../infrastructure";
import { authMiddleware } from "../../../middleware";
import { RankingIdParamSchema } from "../../../schema/ranking-id-param.schema";
import type { AppEnv } from "../../../types";
import { formatZodErrors } from "../../../util";

/**
 * ゴミ箱のランキング取得
 */
const getTrashMyRanking = new Hono<AppEnv>().get(API_ENDPOINT.MY_RANKING_TRASH_ID,
  authMiddleware,
  zValidator("param", RankingIdParamSchema, (result, c) => {
    if (!result.success) {
      return c.json({ message: result.error.message, data: formatZodErrors(result.error) }, HTTP_STATUS.BAD_REQUEST);
    }
  }),
  async (c) => {
    const db = c.get('db');
    const repository = new GetTrashMyRankingRepository(db);
    const user = c.get("user");
    if (!user) {
      return c.json({ message: "認証エラー" }, HTTP_STATUS.UNAUTHORIZED);
    }
    const userId = UserId.of(user.userId.value);
    const rankingId = RankingId.of(c.req.valid("param").rankingId);
    const usecase = new GetTrashMyRankingUsecase(repository);

    const result = await usecase.execute(userId, rankingId);

    if (!result) {
      return c.json({ message: "削除済みランキングが存在しません" }, HTTP_STATUS.NOT_FOUND);
    }

    return c.json({ message: "削除済みランキングを取得しました。", data: result }, HTTP_STATUS.OK);
  });

export { getTrashMyRanking };
