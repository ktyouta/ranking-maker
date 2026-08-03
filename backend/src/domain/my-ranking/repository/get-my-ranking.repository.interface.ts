import { UserId } from "../../user";
import { RankingId } from "../value-object/ranking-id";

export type RankingType = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  publicStatus: number;
  publicStatusName: string;
};

export type RankingOrderType = {
  id: string;
  itemName: string;
  memo: string | null;
  createdAt: string;
};

/**
 * ランキング取得リポジトリインターフェース
 */
export interface IGetMyRankingRepository {
  /**
   * ランキングマスタ取得
   */
  findRanking(userId: UserId, rankingId: RankingId): Promise<RankingType | null>;

  /**
   * ランキングオーダー取得
   * @param rankingId 
   */
  findRankingOrder(rankingId: RankingId): Promise<RankingOrderType[]>;
}
