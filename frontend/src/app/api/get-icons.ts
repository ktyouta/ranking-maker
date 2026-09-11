import { rpc } from '@/lib/rpc-client';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { InferResponseType } from 'hono/client';
import { iconKeys } from './query-key';

const endpoint = rpc.api.v1['my-ranking'].icons.$get;

export type IconType = InferResponseType<typeof endpoint, 200>['data'][number];

/**
 * アイコン一覧取得API呼び出し hook（Suspense対応）
 * ランキング作成・編集フォームで共有して使用する
 */
export function useIcons() {
    return useSuspenseQuery({
        queryKey: iconKeys.all,
        queryFn: async () => {
            const res = await endpoint();
            if (!res.ok) {
                throw new Error('アイコン一覧の取得に失敗しました');
            }
            return res.json();
        },
    });
}
