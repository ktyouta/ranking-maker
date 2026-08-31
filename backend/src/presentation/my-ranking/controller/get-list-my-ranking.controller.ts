import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { GetListMyRankingUsecase } from "../../../application";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { UserId } from "../../../domain";
import { GetListMyRankingRepository } from "../../../infrastructure";
import { authMiddleware } from "../../../middleware";
import type { AppEnv } from "../../../types";
import { formatZodErrors } from "../../../util";
import { GetListMyRankingQuerySchema } from "../schema";

/**
 * ランキング一覧取得
 */
const getListMyRanking = new Hono<AppEnv>().get(API_ENDPOINT.MY_RANKING,
  authMiddleware,
  zValidator("query", GetListMyRankingQuerySchema, (result, c) => {
    if (!result.success) {
      return c.json({ message: "クエリが不正です。", data: formatZodErrors(result.error) }, HTTP_STATUS.UNPROCESSABLE_ENTITY);
    }
  }),
  async (c) => {
    const db = c.get('db');
    const repository = new GetListMyRankingRepository(db);
    const user = c.get("user");
    if (!user) {
      return c.json({ message: "認証エラー" }, HTTP_STATUS.UNAUTHORIZED);
    }
    const userId = UserId.of(user.userId.value);
    const query = c.req.valid("query");
    const usecase = new GetListMyRankingUsecase(repository);

    const { list, total } = await usecase.execute(userId, query);
    const totalPages = Math.ceil(total / GetListMyRankingRepository.LIMIT);

    return c.json({ message: "ランキング一覧を取得しました。", data: { list, total, totalPages } }, HTTP_STATUS.OK);
  });

export { getListMyRanking };
