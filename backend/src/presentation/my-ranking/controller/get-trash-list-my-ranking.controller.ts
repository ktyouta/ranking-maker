import { Hono } from "hono";
import { GetTrashListMyRankingUsecase } from "../../../application";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { UserId } from "../../../domain";
import { GetTrashListMyRankingRepository } from "../../../infrastructure";
import { authMiddleware } from "../../../middleware";
import type { AppEnv } from "../../../types";

/**
 * ゴミ箱のランキング一覧取得
 */
const getTrashListMyRanking = new Hono<AppEnv>().get(API_ENDPOINT.MY_RANKING_TRASH,
  authMiddleware,
  async (c) => {
    const db = c.get('db');
    const repository = new GetTrashListMyRankingRepository(db);
    const user = c.get("user");
    if (!user) {
      return c.json({ message: "認証エラー" }, HTTP_STATUS.UNAUTHORIZED);
    }
    const userId = UserId.of(user.userId.value);
    const usecase = new GetTrashListMyRankingUsecase(repository);

    const result = await usecase.execute(userId);

    return c.json({ message: "削除済みランキング一覧を取得しました。", data: result }, HTTP_STATUS.OK);
  });

export { getTrashListMyRanking };
