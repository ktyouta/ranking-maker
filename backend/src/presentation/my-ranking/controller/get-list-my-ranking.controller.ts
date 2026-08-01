import { Hono } from "hono";
import { GetListMyRankingUsecase } from "../../../application/my-ranking";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { UserId } from "../../../domain/user";
import { GetListMyRankingRepository } from "../../../infrastructure/my-ranking";
import { authMiddleware } from "../../../middleware";
import type { AppEnv } from "../../../types";

/**
 * ランキング一覧取得
 */
const getListMyRanking = new Hono<AppEnv>().get(API_ENDPOINT.MY_RANKING,
  authMiddleware,
  async (c) => {
    const db = c.get('db');
    const repository = new GetListMyRankingRepository(db);
    const user = c.get("user");
    if (!user) {
      return c.json({ message: "認証エラー" }, HTTP_STATUS.UNAUTHORIZED);
    }
    const userId = UserId.of(user.userId.value);
    const usecase = new GetListMyRankingUsecase(repository);

    const result = await usecase.execute(userId);

    return c.json({ message: "ランキング一覧を取得しました。", data: result }, HTTP_STATUS.OK);
  });

export { getListMyRanking };
