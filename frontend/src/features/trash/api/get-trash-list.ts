import { rpc } from '@/lib/rpc-client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { type InferResponseType } from 'hono';
import { TRASH_QUERY_KEY } from '../constants/trash-query-params';
import { type TrashSortType } from '../constants/trash-sort-options';
import { trashKeys } from './query-key';

const endpoint = rpc.api.v1['my-ranking'].trash.$get;

export type TrashListReturnType = InferResponseType<typeof endpoint, 200>['data'];

type PropsType = {
  searchParams: URLSearchParams;
  sort: TrashSortType;
  page: number;
};

/**
 * ゴミ箱一覧取得API呼び出し hook
 * RPC クライアントを使用した型安全なAPI呼び出し（Suspense対応）
 * @param props.searchParams 絞り込み条件を含むクエリパラメータ
 * @param props.sort 並び順（URLの値を選択肢で補正済み）
 * @param props.page ページ番号（URLの値を1以上の整数に補正済み）
 */
export function useTrashList({ searchParams, sort, page }: PropsType) {
  return useSuspenseQuery({
    queryKey: trashKeys.list(searchParams),
    queryFn: async () => {
      const res = await endpoint({
        query: {
          keyword: searchParams.get(TRASH_QUERY_KEY.KEYWORD) || undefined,
          createdAtFrom: searchParams.get(TRASH_QUERY_KEY.CREATED_AT_FROM) || undefined,
          createdAtTo: searchParams.get(TRASH_QUERY_KEY.CREATED_AT_TO) || undefined,
          updatedAtFrom: searchParams.get(TRASH_QUERY_KEY.UPDATED_AT_FROM) || undefined,
          updatedAtTo: searchParams.get(TRASH_QUERY_KEY.UPDATED_AT_TO) || undefined,
          tags: searchParams.get(TRASH_QUERY_KEY.TAGS) || undefined,
          sort,
          page: String(page),
        },
      });
      if (!res.ok) {
        throw new Error('削除済みランキング一覧の取得に失敗しました');
      }
      return res.json();
    },
  });
}
