import { UserId } from "../../user";

export type RankingListType = {
  id: string;
  title: string;
  userName: string;
  createdAt: string;
  publicStatus: number;
  publicStatusName: string;
};

/**
 * ランキング一覧取得リポジトリインターフェース
 */
export interface IGetListMyRankingRepository {
  /**
   * 全件取得
   */
  findAll(userId: UserId): Promise<RankingListType[]>;
}
