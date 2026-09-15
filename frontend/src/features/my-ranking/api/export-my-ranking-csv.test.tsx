import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('@/config/env', () => ({
    env: { API_URL: 'http://localhost:8787' },
}));

import { useExportMyRankingCsvMutation } from './export-my-ranking-csv';

describe('useExportMyRankingCsvMutation', () => {

    const originalFetch = global.fetch;
    let queryClient: QueryClient;

    function createWrapper() {
        return function Wrapper({ children }: { children: ReactNode }) {
            return (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            );
        };
    }

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        });
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
        global.fetch = originalFetch;
        vi.unstubAllGlobals();
    });

    test('CSVレスポンス先頭のBOM（EF BB BF）がダウンロード用Blobまで保持される', async () => {

        const bom = '﻿';
        const csvBody = `${bom}ランキングタイトル,順位,項目名,メモ\r\n好きな曲,1,曲A,`;

        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
            new Response(csvBody, {
                status: 200,
                headers: {
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Content-Disposition': 'attachment; filename="ranking_export_20260101_000000.csv"',
                },
            })
        );

        const onSuccess = vi.fn();

        const { result } = renderHook(
            () => useExportMyRankingCsvMutation({ onSuccess, onError: vi.fn() }),
            { wrapper: createWrapper() }
        );

        act(() => {
            result.current.mutate(['ranking-1']);
        });

        await waitFor(() => expect(onSuccess).toHaveBeenCalled());

        const successResult = onSuccess.mock.calls[0][0];

        if (successResult.isEmpty) {
            throw new Error('想定外: isEmpty=trueが返された');
        }

        // jsdom の Blob は arrayBuffer() 未対応のため FileReader でバイト列を読み出す
        const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as ArrayBuffer);
            reader.onerror = reject;
            reader.readAsArrayBuffer(successResult.csvBlob);
        });
        const bytes = new Uint8Array(buffer);

        expect([bytes[0], bytes[1], bytes[2]]).toEqual([0xEF, 0xBB, 0xBF]);
        expect(successResult.filename).toBe('ranking_export_20260101_000000.csv');
    });
});
