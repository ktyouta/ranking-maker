import { Hono } from "hono";
import { GetIconsUsecase } from "../../../application";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { GetIconsRepository } from "../../../infrastructure";
import { authMiddleware } from "../../../middleware";
import type { AppEnv } from "../../../types";

/**
 * アイコン一覧取得
 */
const getIcons = new Hono<AppEnv>().get(API_ENDPOINT.MY_RANKING_ICONS,
  authMiddleware,
  async (c) => {
    const db = c.get('db');
    const repository = new GetIconsRepository(db);
    const usecase = new GetIconsUsecase(repository);

    const result = await usecase.execute();

    return c.json({ message: "アイコン一覧を取得しました。", data: result.value }, HTTP_STATUS.OK);
  });

export { getIcons };
