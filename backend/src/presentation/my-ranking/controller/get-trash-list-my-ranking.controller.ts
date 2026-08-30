import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { GetTrashListMyRankingUsecase } from "../../../application";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { UserId } from "../../../domain";
import { GetTrashListMyRankingRepository } from "../../../infrastructure";
import { authMiddleware } from "../../../middleware";
import type { AppEnv } from "../../../types";
import { formatZodErrors } from "../../../util";
import { GetTrashListMyRankingQuerySchema } from "../schema";

/**
 * ゴミ箱のランキング一覧取得
 */
const getTrashListMyRanking = new Hono<AppEnv>().get(API_ENDPOINT.MY_RANKING_TRASH,
  authMiddleware,
  zValidator("query", GetTrashListMyRankingQuerySchema, (result, c) => {
    if (!result.success) {
      return c.json({ message: "クエリが不正です。", data: formatZodErrors(result.error) }, HTTP_STATUS.UNPROCESSABLE_ENTITY);
    }
  }),
  async (c) => {
    const db = c.get('db');
    const repository = new GetTrashListMyRankingRepository(db);
    const user = c.get("user");
    if (!user) {
      return c.json({ message: "認証エラー" }, HTTP_STATUS.UNAUTHORIZED);
    }
    const userId = UserId.of(user.userId.value);
    const query = c.req.valid("query");
    const usecase = new GetTrashListMyRankingUsecase(repository);

    const { list, total } = await usecase.execute(userId, query);
    const totalPages = Math.ceil(total / GetTrashListMyRankingRepository.LIMIT);

    return c.json({ message: "削除済みランキング一覧を取得しました。", data: { list, total, totalPages } }, HTTP_STATUS.OK);
  });

export { getTrashListMyRanking };
