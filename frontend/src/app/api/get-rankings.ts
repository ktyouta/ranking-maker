import { rpc } from '@/lib/rpc-client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { type InferResponseType } from 'hono';
import { type RankingListParamsType, rankingKeys } from './query-key';

const endpoint = rpc.api.v1['ranking'].$get;

export type RankingListQueryDataType = InferResponseType<typeof endpoint, 200>;
export type RankingListReturnType = RankingListQueryDataType['data'];

/**
 * ランキング一覧取得API呼び出し hook
 * RPC クライアントを使用した型安全なAPI呼び出し（Suspense対応）
 * 複数機能（マイランキング一覧・テンプレート選択等）から共有して使用する
 */
export function useRankings(params: RankingListParamsType) {
  return useSuspenseQuery({
    queryKey: rankingKeys.list(params),
    queryFn: async () => {
      const res = await endpoint({
        query: {
          keyword: params.keyword || undefined,
          createdAtFrom: params.createdAtFrom || undefined,
          createdAtTo: params.createdAtTo || undefined,
          updatedAtFrom: params.updatedAtFrom || undefined,
          updatedAtTo: params.updatedAtTo || undefined,
          favoriteOnly: params.favoriteOnly || undefined,
          tags: params.tags || undefined,
          sort: params.sort || undefined,
          page: params.page || undefined,
        },
      });
      if (!res.ok) {
        throw new Error('ランキング一覧の取得に失敗しました');
      }
      return res.json();
    },
  });
}
