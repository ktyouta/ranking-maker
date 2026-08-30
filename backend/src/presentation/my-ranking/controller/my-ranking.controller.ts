import { Hono } from "hono";
import type { AppEnv } from "../../../types";
import { createMyRanking } from "./create-my-ranking.controller";
import { getListMyRanking } from "./get-list-my-ranking.controller";
import { getMyRanking } from "./get-my-ranking.controller";
import { getTrashListMyRanking } from "./get-trash-list-my-ranking.controller";
import { getTrashMyRanking } from "./get-trash-my-ranking.controller";
import { permanentDeleteMyRanking } from "./permanent-delete-my-ranking.controller";
import { restoreMyRanking } from "./restore-my-ranking.controller";
import { softDeleteMyRanking } from "./soft-delete-my-ranking.controller";
import { updateMyRanking } from "./update-my-ranking.controller";

// ルーティング（チェーンで型情報を保持）
// GET /trash は GET /:rankingId と同階層で衝突するため、Hono のルーティング解決順の都合上、
// 静的パス（/trash 配下）を :rankingId を含む動的パスより先に登録する
const myRanking = new Hono<AppEnv>()
    .route("/", getListMyRanking)
    .route("/", createMyRanking)
    .route("/", getTrashListMyRanking)
    .route("/", getTrashMyRanking)
    .route("/", permanentDeleteMyRanking)
    .route("/", restoreMyRanking)
    .route("/", getMyRanking)
    .route("/", softDeleteMyRanking)
    .route("/", updateMyRanking);

export { myRanking };
