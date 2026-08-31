import { UserId } from "../../user";

export type MyRankingListType = {
  id: string;
  title: string;
  userName: string;
  createdAt: string;
  publicStatus: number;
  publicStatusName: string;
  itemCount: number;
};

/**
 * ランキング一覧取得条件
 */
export type MyRankingQueryType = {
  title?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
  updatedAtFrom?: string;
  updatedAtTo?: string;
  page: number;
};

/**
 * ランキング一覧取得リポジトリインターフェース
 */
export interface IGetListMyRankingRepository {
  /**
   * 一覧取得（ページング・絞り込み対応）
   */
  findAll(userId: UserId, query: MyRankingQueryType): Promise<MyRankingListType[]>;
  /**
   * 件数取得
   */
  count(userId: UserId, query: MyRankingQueryType): Promise<number>;
}
