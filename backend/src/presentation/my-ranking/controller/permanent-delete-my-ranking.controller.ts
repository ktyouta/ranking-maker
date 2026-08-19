import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { PermanentDeleteMyRankingUsecase } from "../../../application";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { RankingId, UserId } from "../../../domain";
import { PermanentDeleteMyRankingRepository } from "../../../infrastructure";
import { authMiddleware } from "../../../middleware";
import { RankingIdParamSchema } from "../../../schema/ranking-id-param.schema";
import type { AppEnv } from "../../../types";
import { formatZodErrors } from "../../../util";

/**
 * ランキング完全削除（物理削除）
 */
const permanentDeleteMyRanking = new Hono<AppEnv>().delete(API_ENDPOINT.MY_RANKING_TRASH_ID,
  authMiddleware,
  zValidator("param", RankingIdParamSchema, (result, c) => {
    if (!result.success) {
      return c.json({ message: result.error.message, data: formatZodErrors(result.error) }, HTTP_STATUS.BAD_REQUEST);
    }
  }),
  async (c) => {
    const db = c.get('db');
    const repository = new PermanentDeleteMyRankingRepository(db);
    const user = c.get("user");
    if (!user) {
      return c.json({ message: "認証エラー" }, HTTP_STATUS.UNAUTHORIZED);
    }
    const userId = UserId.of(user.userId.value);
    const rankingId = RankingId.of(c.req.valid("param").rankingId);
    const usecase = new PermanentDeleteMyRankingUsecase(repository);

    const result = await usecase.execute(userId, rankingId);

    if (result.isErr()) {
      return c.json({ message: "完全削除対象のランキングが存在しません。" }, HTTP_STATUS.NOT_FOUND);
    }

    return c.json({ message: "ランキングを完全に削除しました。" }, HTTP_STATUS.OK);
  });

export { permanentDeleteMyRanking };
