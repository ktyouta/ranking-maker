/**
 * APIエンドポイント定数
 */
export const API_ENDPOINT = {
  HEALTH: "/api/v1/health",
  SAMPLE: "/api/v1/sample",
  USER: "/api/v1/user",
  USER_ID: "/api/v1/user/:userId",
  USER_LOGIN: "/api/v1/user-login",
  REFRESH: "/api/v1/refresh",
  VERIFY: "/api/v1/verify",
  USER_LOGOUT: "/api/v1/user-logout",
  USER_PASSWORD: "/api/v1/user-password/:userId",
  RANKING: "/api/v1/ranking",
  MY_RANKING: "/api/v1/my-ranking",
  MY_RANKING_ID: "/api/v1/my-ranking/:rankingId",
  MY_RANKING_TRASH_ID_RESTORE: "/api/v1/my-ranking/trash/:rankingId/restore",
  MY_RANKING_TRASH: "/api/v1/my-ranking/trash",
  MY_RANKING_TRASH_ID: "/api/v1/my-ranking/trash/:rankingId",
} as const;

export type ApiEndpointType = (typeof API_ENDPOINT)[keyof typeof API_ENDPOINT];
