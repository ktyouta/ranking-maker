import { rpc } from '@/lib/rpc-client';
import { useQuery } from '@tanstack/react-query';
import { trashKeys } from './query-key';

const endpoint = rpc.api.v1['my-ranking'].trash['filter-tags'].$get;

/**
 * ゴミ箱一覧の絞り込み候補タグ取得API呼び出し hook
 * 一覧の初期表示を待たせないため Suspense を使わずに取得する
 */
export function useTrashFilterTags() {
    return useQuery({
        queryKey: trashKeys.filterTags(),
        queryFn: async () => {
            const res = await endpoint();
            if (!res.ok) {
                throw new Error('ゴミ箱の絞り込み候補のタグ一覧の取得に失敗しました');
            }
            return res.json();
        },
    });
}
