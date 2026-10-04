import { Hono } from "hono";
import type { AppEnv } from "../../../../types";
import { bulkRestoreMyRanking } from "../bulk-restore-my-ranking/bulk-restore-my-ranking.controller";
import { bulkSoftDeleteMyRanking } from "../bulk-soft-delete-my-ranking/bulk-soft-delete-my-ranking.controller";
import { createMyRanking } from "../create-my-ranking/create-my-ranking.controller";
import { favoriteMyRanking } from "../favorite-my-ranking/favorite-my-ranking.controller";
import { getFilterTags } from "../get-filter-tags/get-filter-tags.controller";
import { getIcons } from "../get-icons/get-icons.controller";
import { getListMyRanking } from "../get-list-my-ranking/get-list-my-ranking.controller";
import { getMyRanking } from "../get-my-ranking/get-my-ranking.controller";
import { getMyRankingExport } from "../get-my-ranking-export/get-my-ranking-export.controller";
import { getTags } from "../get-tags/get-tags.controller";
import { getTrashFilterTags } from "../get-trash-filter-tags/get-trash-filter-tags.controller";
import { getTrashListMyRanking } from "../get-trash-list-my-ranking/get-trash-list-my-ranking.controller";
import { getTrashMyRanking } from "../get-trash-my-ranking/get-trash-my-ranking.controller";
import { permanentDeleteMyRanking } from "../permanent-delete-my-ranking/permanent-delete-my-ranking.controller";
import { restoreMyRanking } from "../restore-my-ranking/restore-my-ranking.controller";
import { softDeleteMyRanking } from "../soft-delete-my-ranking/soft-delete-my-ranking.controller";
import { updateMyRanking } from "../update-my-ranking/update-my-ranking.controller";

// ルーティング（チェーンで型情報を保持）
// GET /trash・GET /icons・GET /tags・GET /filter-tags は GET /:rankingId と同階層で衝突し、
// GET /trash/filter-tags は GET /trash/:rankingId と衝突するため、Hono のルーティング解決順の都合上、
// 静的パス（/trash, /icons, /tags, /filter-tags 配下）を :rankingId を含む動的パスより先に登録する
const myRanking = new Hono<AppEnv>()
    .route("/", getListMyRanking)
    .route("/", createMyRanking)
    .route("/", bulkSoftDeleteMyRanking)
    .route("/", bulkRestoreMyRanking)
    .route("/", getTrashListMyRanking)
    .route("/", getTrashFilterTags)
    .route("/", getTrashMyRanking)
    .route("/", permanentDeleteMyRanking)
    .route("/", restoreMyRanking)
    .route("/", getIcons)
    .route("/", getTags)
    .route("/", getFilterTags)
    .route("/", getMyRankingExport)
    .route("/", getMyRanking)
    .route("/", softDeleteMyRanking)
    .route("/", updateMyRanking)
    .route("/", favoriteMyRanking);

export { myRanking };
