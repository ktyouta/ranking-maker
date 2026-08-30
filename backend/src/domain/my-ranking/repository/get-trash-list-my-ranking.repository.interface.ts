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
 * ゴミ箱のランキング一覧取得リポジトリインターフェース
 */
export interface IGetTrashListMyRankingRepository {
  /**
   * 削除済み全件取得
   */
  findAll(userId: UserId): Promise<TrashMyRankingListType[]>;
}
