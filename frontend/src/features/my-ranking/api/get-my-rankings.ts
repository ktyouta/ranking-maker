import { rpc } from '@/lib/rpc-client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { InferResponseType } from 'hono';
import { MY_RANKING_QUERY_KEY } from '../constants/my-ranking-query-params';
import { myRankingKeys } from './query-key';

const endpoint = rpc.api.v1['my-ranking'].$get;

export type MyRankingListQueryDataType = InferResponseType<typeof endpoint, 200>;
export type MyRankingListReturnType = MyRankingListQueryDataType['data'];

type PropsType = {
  searchParams: URLSearchParams;
};

/**
 * ランキング一覧取得API呼び出し hook
 * RPC クライアントを使用した型安全なAPI呼び出し（Suspense対応）
 */
export function useMyRankings({ searchParams }: PropsType) {
  return useSuspenseQuery({
    queryKey: myRankingKeys.list(searchParams),
    queryFn: async () => {
      const res = await endpoint({
        query: {
          keyword: searchParams.get(MY_RANKING_QUERY_KEY.KEYWORD) || undefined,
          createdAtFrom: searchParams.get(MY_RANKING_QUERY_KEY.CREATED_AT_FROM) || undefined,
          createdAtTo: searchParams.get(MY_RANKING_QUERY_KEY.CREATED_AT_TO) || undefined,
          updatedAtFrom: searchParams.get(MY_RANKING_QUERY_KEY.UPDATED_AT_FROM) || undefined,
          updatedAtTo: searchParams.get(MY_RANKING_QUERY_KEY.UPDATED_AT_TO) || undefined,
          favoriteOnly: searchParams.get(MY_RANKING_QUERY_KEY.FAVORITE_ONLY) || undefined,
          page: searchParams.get(MY_RANKING_QUERY_KEY.PAGE) || undefined,
        },
      });
      if (!res.ok) {
        throw new Error('ランキング一覧の取得に失敗しました');
      }
      return res.json();
    },
  });
}
