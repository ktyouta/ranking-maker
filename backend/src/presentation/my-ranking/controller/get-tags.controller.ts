import { Hono } from "hono";
import { GetTagsUsecase } from "../../../application";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { UserId } from "../../../domain";
import { GetTagsRepository } from "../../../infrastructure";
import { authMiddleware } from "../../../middleware";
import type { AppEnv } from "../../../types";

/**
 * タグ一覧取得
 */
const getTags = new Hono<AppEnv>().get(API_ENDPOINT.MY_RANKING_TAGS,
  authMiddleware,
  async (c) => {
    const db = c.get('db');
    const repository = new GetTagsRepository(db);
    const user = c.get("user");
    if (!user) {
      return c.json({ message: "認証エラー" }, HTTP_STATUS.UNAUTHORIZED);
    }
    const userId = UserId.of(user.userId.value);
    const usecase = new GetTagsUsecase(repository);

    const result = await usecase.execute(userId);

    return c.json({ message: "タグ一覧を取得しました。", data: result.value }, HTTP_STATUS.OK);
  });

export { getTags };
