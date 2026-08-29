import { myRankingKeys } from '@/features/my-ranking/api/query-key';
import { rpc } from '@/lib/rpc-client';
import { useSuspenseQuery } from '@tanstack/react-query';

/**
 * ランキング詳細取得API呼び出し hook
 * RPC クライアントを使用した型安全なAPI呼び出し（Suspense対応）
 * @param rankingId ランキングID
 */
export function useRanking(rankingId: string) {
  return useSuspenseQuery({
    queryKey: myRankingKeys.detail(rankingId),
    queryFn: async () => {
      const res = await rpc.api.v1['my-ranking'][':rankingId'].$get({ param: { rankingId } });
      if (!res.ok) {
        throw new Error('ランキングの取得に失敗しました');
      }
      return res.json();
    },
  });
}
