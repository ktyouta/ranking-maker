import { rpc } from '@/lib/rpc-client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { myRankingKeys } from './query-key';

/**
 * ランキング一覧取得API呼び出し hook
 * RPC クライアントを使用した型安全なAPI呼び出し（Suspense対応）
 */
export function useMyRankings() {
  return useSuspenseQuery({
    queryKey: myRankingKeys.lists(),
    queryFn: async () => {
      const res = await rpc.api.v1['my-ranking'].$get();
      if (!res.ok) {
        throw new Error('ランキング一覧の取得に失敗しました');
      }
      return res.json();
    },
  });
}
