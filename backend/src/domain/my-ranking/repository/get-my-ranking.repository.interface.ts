import { UserId } from "../../user";
import { RankingId } from "../../shared";

export type MyRankingType = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  publicStatus: number;
  publicStatusName: string;
};

export type MyRankingOrderType = {
  id: string;
  itemName: string | null;
  itemMemo: string | null;
  createdAt: string;
};

/**
 * ランキング取得リポジトリインターフェース
 */
export interface IGetMyRankingRepository {
  /**
   * ランキングマスタ取得
   */
  findRanking(userId: UserId, rankingId: RankingId): Promise<MyRankingType | null>;

  /**
   * ランキングオーダー取得
   * @param rankingId 
   */
  findRankingOrder(rankingId: RankingId): Promise<MyRankingOrderType[]>;
}
