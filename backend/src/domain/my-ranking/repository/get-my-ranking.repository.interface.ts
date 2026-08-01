import { UserId } from "../../user";
import { RankingId } from "../value-object/ranking-id";

export type RankingType = {
  id: string;
  title: string;
  userName: string;
  createdAt: string;
  publicStatus: number;
  publicStatusName: string;
};

export type RankingOrderType = {
  id: string;
  title: string;
  userName: string;
  createdAt: string;
};

/**
 * ランキング取得リポジトリインターフェース
 */
export interface IGetMyRankingRepository {
  /**
   * ランキングマスタ取得
   */
  findRanking(userId: UserId): Promise<RankingType>;

  /**
   * ランキングオーダー取得
   * @param rankingId 
   */
  findRankingOrder(rankingId: RankingId): Promise<RankingOrderType>;
}
