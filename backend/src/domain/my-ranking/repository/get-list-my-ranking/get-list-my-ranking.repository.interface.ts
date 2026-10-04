import { UserId } from "../../../shared";
import { RankingSort, TagName } from "../../value-object";

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
  // 指定したタグがすべて付いているランキングに絞り込む
  tagNames?: TagName[];
  sort: RankingSort;
  // 1始まりのページ番号
  page: number;
};

/**
 * ランキング一覧取得リポジトリインターフェース
 */
export interface IGetListMyRankingRepository {
  /**
   * 一覧取得（ページング・絞り込み対応）
   * @param userId ランキングを所有するユーザーID
   * @param query 絞り込み・並び順・ページ番号の条件
   * @param pageSize 1ページあたりの最大取得件数
   * @returns 指定ページのランキング一覧
   */
  findAll(userId: UserId, query: MyRankingQueryType, pageSize: number): Promise<MyRankingListType[]>;
  /**
   * 件数取得
   * @param userId ランキングを所有するユーザーID
   * @param query 絞り込み条件（ページ番号は使わない）
   * @returns 絞り込み条件に一致する全件数
   */
  count(userId: UserId, query: Omit<MyRankingQueryType, "page">): Promise<number>;
}
