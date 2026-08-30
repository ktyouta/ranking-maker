import { rpc } from '@/lib/rpc-client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { InferResponseType } from 'hono';
import { TRASH_QUERY_KEY } from '../constants/trash-query-params';
import { trashKeys } from './query-key';

const endpoint = rpc.api.v1['my-ranking'].trash.$get;

export type TrashListReturnType = InferResponseType<typeof endpoint, 200>['data'];

type PropsType = {
  searchParams: URLSearchParams;
};

/**
 * ゴミ箱一覧取得API呼び出し hook
 * RPC クライアントを使用した型安全なAPI呼び出し（Suspense対応）
 */
export function useTrashList({ searchParams }: PropsType) {
  return useSuspenseQuery({
    queryKey: trashKeys.list(searchParams),
    queryFn: async () => {
      const res = await endpoint({
        query: {
          title: searchParams.get(TRASH_QUERY_KEY.TITLE) || undefined,
          createdAtFrom: searchParams.get(TRASH_QUERY_KEY.CREATED_AT_FROM) || undefined,
          createdAtTo: searchParams.get(TRASH_QUERY_KEY.CREATED_AT_TO) || undefined,
          updatedAtFrom: searchParams.get(TRASH_QUERY_KEY.UPDATED_AT_FROM) || undefined,
          updatedAtTo: searchParams.get(TRASH_QUERY_KEY.UPDATED_AT_TO) || undefined,
          page: searchParams.get(TRASH_QUERY_KEY.PAGE) || undefined,
        },
      });
      if (!res.ok) {
        throw new Error('削除済みランキング一覧の取得に失敗しました');
      }
      return res.json();
    },
  });
}
