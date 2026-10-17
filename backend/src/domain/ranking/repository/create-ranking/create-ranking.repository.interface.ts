import { RankingAggregate, TagAggregate } from "../../aggregate";

/**
 * ランキング作成リポジトリインターフェース
 */
export interface ICreateRankingRepository {
  /**
   * ランキング作成
   * ランキングと、ランキングに付与する新規タグをまとめて保存する。
   * @param rankingAggregate
   * @param newTagAggregates ランキングに付与する新規タグ
   */
  createRanking(rankingAggregate: RankingAggregate, newTagAggregates: TagAggregate[]): Promise<void>;
}
