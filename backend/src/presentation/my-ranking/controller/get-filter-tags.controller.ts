import { Hono } from "hono";
import { GetFilterTagsUsecase } from "../../../application";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { UserId } from "../../../domain";
import { GetFilterTagsRepository } from "../../../infrastructure";
import { authMiddleware } from "../../../middleware";
import type { AppEnv } from "../../../types";

/**
 * ランキング一覧の絞り込み候補タグ取得
 */
const getFilterTags = new Hono<AppEnv>().get(API_ENDPOINT.MY_RANKING_FILTER_TAGS,
  authMiddleware,
  async (c) => {
    const db = c.get('db');
    const repository = new GetFilterTagsRepository(db);
    const user = c.get("user");
    if (!user) {
      return c.json({ message: "認証エラー" }, HTTP_STATUS.UNAUTHORIZED);
    }
    const userId = UserId.of(user.userId.value);
    const usecase = new GetFilterTagsUsecase(repository);

    const result = await usecase.execute(userId);

    return c.json({ message: "絞り込み候補のタグ一覧を取得しました。", data: result.value }, HTTP_STATUS.OK);
  });

export { getFilterTags };
