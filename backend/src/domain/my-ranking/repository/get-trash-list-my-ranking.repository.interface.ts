import { UserId } from "../../user";

export type TrashMyRankingListType = {
  id: string;
  title: string;
  userName: string;
  createdAt: string;
  publicStatus: number;
  publicStatusName: string;
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
