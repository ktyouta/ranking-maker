import { hc } from 'hono/client';
import type { AppType } from '@backend/rpc';
import { env } from '@/config/env';
import { getAccessToken, handleRefresh } from '@/lib/refresh-handler';

/**
 * 401時にリフレッシュ・リトライを行うカスタムfetch
 */
async function fetchWithRefresh(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {

  const headers = new Headers(init?.headers);

  const accessToken = getAccessToken();
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(input, { ...init, headers });

  if (response.status !== 401) {
    return response;
  }

  // 401: リフレッシュ後にリトライ
  try {
    const newAccessToken = await handleRefresh();

    headers.set('Authorization', `Bearer ${newAccessToken}`);

    return fetch(input, { ...init, headers });
  } catch {
    // リフレッシュ失敗時は元の401レスポンスを返す
    return response;
  }
}

/**
 * Hono RPC クライアント
 * バックエンドの型定義から型安全なAPIクライアントを生成
 */
export const rpc = hc<AppType>(env.API_URL, {
  fetch: fetchWithRefresh,
  init: {
    credentials: 'include',
  },
});

/**
 * RPC クライアントの型
 */
export type RpcClient = typeof rpc;
