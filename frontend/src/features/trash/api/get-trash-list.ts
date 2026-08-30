import { rpc } from '@/lib/rpc-client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { trashKeys } from './query-key';

/**
 * ゴミ箱一覧取得API呼び出し hook
 * RPC クライアントを使用した型安全なAPI呼び出し（Suspense対応）
 */
export function useTrashList() {
  return useSuspenseQuery({
    queryKey: trashKeys.lists(),
    queryFn: async () => {
      const res = await rpc.api.v1['my-ranking'].trash.$get();
      if (!res.ok) {
        throw new Error('削除済みランキング一覧の取得に失敗しました');
      }
      return res.json();
    },
  });
}
