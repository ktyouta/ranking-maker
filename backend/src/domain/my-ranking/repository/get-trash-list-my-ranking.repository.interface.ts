import { UserId } from "../../user";

export type TrashMyRankingListType = {
  id: string;
  title: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
  publicStatus: number;
  publicStatusName: string;
  itemCount: number;
};

/**
 * ゴミ箱のランキング一覧取得条件（updatedAtFrom/updatedAtTo は削除日時に転用した updatedAt の範囲を表す）
 */
export type TrashMyRankingQueryType = {
  title?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
  updatedAtFrom?: string;
  updatedAtTo?: string;
  page: number;
};

/**
 * ゴミ箱のランキング一覧取得リポジトリインターフェース
 */
export interface IGetTrashListMyRankingRepository {
  /**
   * 削除済み一覧取得（ページング・絞り込み対応）
   */
  findAll(userId: UserId, query: TrashMyRankingQueryType): Promise<TrashMyRankingListType[]>;
  /**
   * 削除済み件数取得
   */
  count(userId: UserId, query: TrashMyRankingQueryType): Promise<number>;
}
