import { RankingAggregate } from "../../shared/aggregate/ranking-aggregate";
import { RankingId } from "../../shared/value-object/ranking-id";
import { UserId } from "../../user";

export type RankingType = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  publicStatus: number;
  publicStatusName: string;
};


/**
 * ランキング作成リポジトリインターフェース
 */
export interface ICreateMyRankingRepository {
  /**
   * ランキングマスタ取得
   */
  findRanking(userId: UserId, rankingId: RankingId): Promise<RankingType | null>;

  /**
   * ランキング作成
   * @param rankingAggregate 
   */
  createRanking(rankingAggregate: RankingAggregate): Promise<void>;
}
