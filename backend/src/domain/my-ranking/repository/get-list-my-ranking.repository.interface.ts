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
 * ランキング一覧取得リポジトリインターフェース
 */
export interface IGetListMyRankingRepository {
  /**
   * 全件取得
   */
  findAll(userId: UserId): Promise<MyRankingListType[]>;
}
