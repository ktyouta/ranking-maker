import { Hono } from "hono";
import { GetTrashFilterTagsUsecase } from "../../../application";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { UserId } from "../../../domain";
import { GetTrashFilterTagsRepository } from "../../../infrastructure";
import { authMiddleware } from "../../../middleware";
import type { AppEnv } from "../../../types";

/**
 * ゴミ箱一覧の絞り込み候補タグ取得
 */
const getTrashFilterTags = new Hono<AppEnv>().get(API_ENDPOINT.MY_RANKING_TRASH_FILTER_TAGS,
  authMiddleware,
  async (c) => {
    const db = c.get('db');
    const repository = new GetTrashFilterTagsRepository(db);
    const user = c.get("user");
    if (!user) {
      return c.json({ message: "認証エラー" }, HTTP_STATUS.UNAUTHORIZED);
    }
    const userId = UserId.of(user.userId.value);
    const usecase = new GetTrashFilterTagsUsecase(repository);

    const result = await usecase.execute(userId);

    return c.json({ message: "ゴミ箱の絞り込み候補のタグ一覧を取得しました。", data: result.value }, HTTP_STATUS.OK);
  });

export { getTrashFilterTags };
