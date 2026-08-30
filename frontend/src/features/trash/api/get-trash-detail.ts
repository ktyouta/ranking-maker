import { rpc } from '@/lib/rpc-client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { trashKeys } from './query-key';

/**
 * ゴミ箱詳細取得API呼び出し hook
 * RPC クライアントを使用した型安全なAPI呼び出し（Suspense対応）
 * @param rankingId ランキングID
 */
export function useTrashDetail(rankingId: string) {
  return useSuspenseQuery({
    queryKey: trashKeys.detail(rankingId),
    queryFn: async () => {
      const res = await rpc.api.v1['my-ranking'].trash[':rankingId'].$get({ param: { rankingId } });
      if (!res.ok) {
        throw new Error('削除済みランキングの取得に失敗しました');
      }
      return res.json();
    },
  });
}
