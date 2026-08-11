import { RankingAggregate } from "../../shared/aggregate/ranking-aggregate";

/**
 * ランキング作成リポジトリインターフェース
 */
export interface ICreateMyRankingRepository {
  /**
   * ランキング作成
   * @param rankingAggregate 
   */
  createRanking(rankingAggregate: RankingAggregate): Promise<void>;
}
