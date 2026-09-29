import { UserId } from "../../shared";
import { TagName, TrashRankingSort } from "../value-object";

export type TrashMyRankingListType = {
  id: string;
  title: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
  publicStatus: number;
  publicStatusName: string;
  icon: number;
  itemCount: number;
};

/**
 * ゴミ箱のランキング一覧取得条件（updatedAtFrom/updatedAtTo は削除日時に転用した updatedAt の範囲を表す）
 */
export type TrashMyRankingQueryType = {
  keyword?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
  updatedAtFrom?: string;
  updatedAtTo?: string;
  // 指定したタグがすべて付いているランキングに絞り込む
  tagNames?: TagName[];
  sort: TrashRankingSort;
  // 1始まりのページ番号
  page: number;
};

/**
 * ゴミ箱のランキング一覧取得リポジトリインターフェース
 */
export interface IGetTrashListMyRankingRepository {
  /**
   * 削除済み一覧取得（ページング・絞り込み対応）
   * @param userId ランキングを所有するユーザーID
   * @param query 絞り込み・並び順・ページ番号の条件
   * @param pageSize 1ページあたりの最大取得件数
   * @returns 指定ページの削除済みランキング一覧
   */
  findAll(userId: UserId, query: TrashMyRankingQueryType, pageSize: number): Promise<TrashMyRankingListType[]>;
  /**
   * 削除済み件数取得
   * @param userId ランキングを所有するユーザーID
   * @param query 絞り込み条件（ページ番号は使わない）
   * @returns 絞り込み条件に一致する全件数
   */
  count(userId: UserId, query: Omit<TrashMyRankingQueryType, "page">): Promise<number>;
}
