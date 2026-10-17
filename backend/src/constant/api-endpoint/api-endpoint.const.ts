/**
 * APIエンドポイント定数
 */
export const API_ENDPOINT = {
  HEALTH: "/api/v1/health",
  USER: "/api/v1/user",
  USER_THEME: "/api/v1/user/theme",
  USER_LOGIN: "/api/v1/user-login",
  REFRESH: "/api/v1/refresh",
  VERIFY: "/api/v1/verify",
  USER_LOGOUT: "/api/v1/user-logout",
  USER_PASSWORD: "/api/v1/user-password",
  RANKING: "/api/v1/ranking",
  RANKING_ICONS: "/api/v1/ranking/icons",
  RANKING_TAGS: "/api/v1/ranking/tags",
  RANKING_FILTER_TAGS: "/api/v1/ranking/filter-tags",
  RANKING_EXPORT: "/api/v1/ranking/export",
  RANKING_BULK_DELETE: "/api/v1/ranking/bulk-delete",
  RANKING_BULK_RESTORE: "/api/v1/ranking/bulk-restore",
  RANKING_ID: "/api/v1/ranking/:rankingId",
  RANKING_ID_FAVORITE: "/api/v1/ranking/:rankingId/favorite",
  RANKING_TRASH_ID_RESTORE: "/api/v1/ranking/trash/:rankingId/restore",
  RANKING_TRASH: "/api/v1/ranking/trash",
  RANKING_TRASH_FILTER_TAGS: "/api/v1/ranking/trash/filter-tags",
  RANKING_TRASH_ID: "/api/v1/ranking/trash/:rankingId",
} as const;

export type ApiEndpointType = (typeof API_ENDPOINT)[keyof typeof API_ENDPOINT];
