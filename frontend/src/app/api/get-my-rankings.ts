import { rpc } from '@/lib/rpc-client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { InferResponseType } from 'hono';
import { MyRankingListParamsType, myRankingKeys } from './query-key';

const endpoint = rpc.api.v1['my-ranking'].$get;

export type MyRankingListQueryDataType = InferResponseType<typeof endpoint, 200>;
export type MyRankingListReturnType = MyRankingListQueryDataType['data'];

/**
 * ランキング一覧取得API呼び出し hook
 * RPC クライアントを使用した型安全なAPI呼び出し（Suspense対応）
 * 複数機能（マイランキング一覧・テンプレート選択等）から共有して使用する
 */
export function useMyRankings(params: MyRankingListParamsType) {
  return useSuspenseQuery({
    queryKey: myRankingKeys.list(params),
    queryFn: async () => {
      const res = await endpoint({
        query: {
          keyword: params.keyword || undefined,
          createdAtFrom: params.createdAtFrom || undefined,
          createdAtTo: params.createdAtTo || undefined,
          updatedAtFrom: params.updatedAtFrom || undefined,
          updatedAtTo: params.updatedAtTo || undefined,
          favoriteOnly: params.favoriteOnly || undefined,
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
