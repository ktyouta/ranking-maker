import { Hono } from "hono";
import type { AppEnv } from "../../../types";
import { getListRanking } from "./get-list-ranking.controller";
import { getRanking } from "./get-ranking.controller";

// ルーティング（チェーンで型情報を保持）
const ranking = new Hono<AppEnv>()
    .route("/", getListRanking)
    .route("/", getRanking);

export { ranking };
