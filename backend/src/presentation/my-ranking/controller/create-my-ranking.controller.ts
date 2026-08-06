import { Hono } from "hono";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { authMiddleware } from "../../../middleware";
import type { AppEnv } from "../../../types";

/**
 * ランキング作成
 */
const createMyRanking = new Hono<AppEnv>().post(API_ENDPOINT.MY_RANKING,
  authMiddleware,
  async (c) => {
    const db = c.get('db');
    const user = c.get("user");
    if (!user) {
      return c.json({ message: "認証エラー" }, HTTP_STATUS.UNAUTHORIZED);
    }

    return c.json({ message: "ランキングを作成しました。", data: [] }, HTTP_STATUS.OK);
  });

export { createMyRanking };
