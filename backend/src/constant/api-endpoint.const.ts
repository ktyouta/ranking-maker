/**
 * APIエンドポイント定数
 */
export const API_ENDPOINT = {
  HEALTH: "/api/v1/health",
  USER: "/api/v1/user",
  USER_ID: "/api/v1/user/:userId",
  USER_LOGIN: "/api/v1/user-login",
  REFRESH: "/api/v1/refresh",
  VERIFY: "/api/v1/verify",
  USER_LOGOUT: "/api/v1/user-logout",
  USER_PASSWORD: "/api/v1/user-password/:userId",
} as const;

export type ApiEndpointType = (typeof API_ENDPOINT)[keyof typeof API_ENDPOINT];
