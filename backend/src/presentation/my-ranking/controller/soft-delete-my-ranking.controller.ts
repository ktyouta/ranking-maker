import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { SoftDeleteMyRankingUsecase } from "../../../application/my-ranking";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { RankingId } from "../../../domain/shared/value-object/ranking-id";
import { UserId } from "../../../domain/user";
import { SoftDeleteMyRankingRepository } from "../../../infrastructure/my-ranking";
import { authMiddleware } from "../../../middleware";
import { RankingIdParamSchema } from "../../../schema/ranking-id-param.schema";
import type { AppEnv } from "../../../types";
import { formatZodErrors } from "../../../util";

/**
 * ランキング削除(論理)
 */
const softDeleteMyRanking = new Hono<AppEnv>().delete(API_ENDPOINT.MY_RANKING_ID,
  authMiddleware,
  zValidator("param", RankingIdParamSchema, (result, c) => {
    if (!result.success) {
      return c.json({ message: result.error.message, data: formatZodErrors(result.error) }, HTTP_STATUS.BAD_REQUEST);
    }
  }),
  async (c) => {
    const db = c.get('db');
    const repository = new SoftDeleteMyRankingRepository(db);
    const user = c.get("user");
    if (!user) {
      return c.json({ message: "認証エラー" }, HTTP_STATUS.UNAUTHORIZED);
    }
    const userId = UserId.of(user.userId.value);
    const rankingId = RankingId.of(c.req.valid("param").rankingId);
    const usecase = new SoftDeleteMyRankingUsecase(repository);

    const result = await usecase.execute(userId, rankingId);

    if (result.isErr()) {
      return c.json({ message: "ランキングが存在しません" }, HTTP_STATUS.NOT_FOUND);
    }

    return c.json({ message: "ランキングを削除しました。" }, HTTP_STATUS.OK);
  });

export { softDeleteMyRanking };
