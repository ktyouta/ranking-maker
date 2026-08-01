import { Hono } from "hono";
import type { AppEnv } from "../../../types";
import { getListMyRanking } from "./get-list-my-ranking.controller";

// ルーティング（チェーンで型情報を保持）
const ranking = new Hono<AppEnv>()
    .route("/", getListMyRanking)

export { ranking };
