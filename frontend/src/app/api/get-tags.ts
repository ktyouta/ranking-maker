import { rpc } from '@/lib/rpc-client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { tagKeys } from './query-key';

const endpoint = rpc.api.v1['ranking'].tags.$get;

/**
 * タグ一覧取得API呼び出し hook（Suspense対応）
 * ランキング作成・編集フォームで共有して使用する
 */
export function useTags() {
    return useSuspenseQuery({
        queryKey: tagKeys.all,
        queryFn: async () => {
            const res = await endpoint();
            if (!res.ok) {
                throw new Error('タグ一覧の取得に失敗しました');
            }
            return res.json();
        },
    });
}
