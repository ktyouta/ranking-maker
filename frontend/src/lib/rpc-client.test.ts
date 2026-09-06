import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/config/env', () => ({
    env: { API_URL: 'http://localhost:8787' },
}));

import { rpc } from './rpc-client';

describe('rpc-client', () => {

    const originalFetch = global.fetch;

    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
        global.fetch = originalFetch;
        vi.unstubAllGlobals();
    });

    test('バックエンドに接続できない場合、生の例外ではなくエラーレスポンスを返す', async () => {

        (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
            new TypeError('Failed to fetch')
        );

        const res = await rpc.api.v1['user-login'].$post({
            json: { name: 'test', password: 'password' },
        });

        expect(res.ok).toBe(false);

        const body = await res.json();
        expect(body.message).toBe('通信エラーが発生しました。しばらくしてから再度お試しください。');
    });
});
