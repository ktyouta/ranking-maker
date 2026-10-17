import { Hono } from "hono";
import type { AppEnv } from "../../../../types";
import { bulkRestoreRanking } from "../bulk-restore-ranking/bulk-restore-ranking.controller";
import { bulkSoftDeleteRanking } from "../bulk-soft-delete-ranking/bulk-soft-delete-ranking.controller";
import { createRanking } from "../create-ranking/create-ranking.controller";
import { favoriteRanking } from "../favorite-ranking/favorite-ranking.controller";
import { getFilterTags } from "../get-filter-tags/get-filter-tags.controller";
import { getIcons } from "../get-icons/get-icons.controller";
import { getListRanking } from "../get-list-ranking/get-list-ranking.controller";
import { getRanking } from "../get-ranking/get-ranking.controller";
import { getRankingExport } from "../get-ranking-export/get-ranking-export.controller";
import { getTags } from "../get-tags/get-tags.controller";
import { getTrashFilterTags } from "../get-trash-filter-tags/get-trash-filter-tags.controller";
import { getTrashListRanking } from "../get-trash-list-ranking/get-trash-list-ranking.controller";
import { getTrashRanking } from "../get-trash-ranking/get-trash-ranking.controller";
import { permanentDeleteRanking } from "../permanent-delete-ranking/permanent-delete-ranking.controller";
import { restoreRanking } from "../restore-ranking/restore-ranking.controller";
import { softDeleteRanking } from "../soft-delete-ranking/soft-delete-ranking.controller";
import { updateRanking } from "../update-ranking/update-ranking.controller";

// ルーティング（チェーンで型情報を保持）
// GET /trash・GET /icons・GET /tags・GET /filter-tags は GET /:rankingId と同階層で衝突し、
// GET /trash/filter-tags は GET /trash/:rankingId と衝突するため、Hono のルーティング解決順の都合上、
// 静的パス（/trash, /icons, /tags, /filter-tags 配下）を :rankingId を含む動的パスより先に登録する
const ranking = new Hono<AppEnv>()
    .route("/", getListRanking)
    .route("/", createRanking)
    .route("/", bulkSoftDeleteRanking)
    .route("/", bulkRestoreRanking)
    .route("/", getTrashListRanking)
    .route("/", getTrashFilterTags)
    .route("/", getTrashRanking)
    .route("/", permanentDeleteRanking)
    .route("/", restoreRanking)
    .route("/", getIcons)
    .route("/", getTags)
    .route("/", getFilterTags)
    .route("/", getRankingExport)
    .route("/", getRanking)
    .route("/", softDeleteRanking)
    .route("/", updateRanking)
    .route("/", favoriteRanking);

export { ranking };
