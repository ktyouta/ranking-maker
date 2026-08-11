import { Hono } from "hono";
import type { AppEnv } from "../../../types";
import { createMyRanking } from "./create-my-ranking.controller";
import { getListMyRanking } from "./get-list-my-ranking.controller";
import { getMyRanking } from "./get-my-ranking.controller";
import { softDeleteMyRanking } from "./soft-delete-my-ranking.controller";
import { updateMyRanking } from "./update-my-ranking.controller";

// ルーティング（チェーンで型情報を保持）
const ranking = new Hono<AppEnv>()
    .route("/", getListMyRanking)
    .route("/", getMyRanking)
    .route("/", createMyRanking)
    .route("/", softDeleteMyRanking)
    .route("/", updateMyRanking);

export { ranking };
