import { UserId } from "../../user";

export type MyRankingListType = {
  id: string;
  title: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
  publicStatus: number;
  publicStatusName: string;
  icon: number;
  itemCount: number;
  isFavorite: boolean;
};

/**
 * ランキング一覧取得条件
 */
export type MyRankingQueryType = {
  keyword?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
  updatedAtFrom?: string;
  updatedAtTo?: string;
  favoriteOnly?: boolean;
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
