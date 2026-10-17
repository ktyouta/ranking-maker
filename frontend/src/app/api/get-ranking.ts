import { rpc } from '@/lib/rpc-client';
import { QueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { type InferResponseType } from 'hono';
import { rankingKeys } from './query-key';

const endpoint = rpc.api.v1['ranking'][':rankingId'].$get;

export type RankingDetailQueryDataType = InferResponseType<typeof endpoint, 200>;

function rankingDetailQueryOptions(rankingId: string) {
  return {
    queryKey: rankingKeys.detail(rankingId),
    queryFn: async () => {
      const res = await endpoint({ param: { rankingId } });
      if (!res.ok) {
        throw new Error('ランキングの取得に失敗しました');
      }
      return res.json();
    },
  };
}

/**
 * ランキング詳細取得API呼び出し hook
 * RPC クライアントを使用した型安全なAPI呼び出し（Suspense対応）
 * 複数機能（マイランキング詳細・編集・テンプレート選択等）から共有して使用する
 * @param rankingId ランキングID
 */
export function useRanking(rankingId: string) {
  return useSuspenseQuery(rankingDetailQueryOptions(rankingId));
}

/**
 * ランキング詳細を命令的に取得する
 * Suspense Query（useRanking）はイベントハンドラから直接呼べないため、その代わりに用意する
 * @param queryClient QueryClient
 * @param rankingId ランキングID
 */
export function fetchRankingDetail(queryClient: QueryClient, rankingId: string) {
  return queryClient.fetchQuery(rankingDetailQueryOptions(rankingId));
}
