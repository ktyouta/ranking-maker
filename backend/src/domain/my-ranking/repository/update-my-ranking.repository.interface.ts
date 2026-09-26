import { RankingAggregate, TagAggregate } from "../aggregate";
import { RankingId, UserId } from "../../shared";


/**
 * ランキング更新リポジトリインターフェース
 */
export interface IUpdateMyRankingRepository {
  /**
   * ランキングマスタ取得（更新対象の存在・所有権チェック用）
   */
  findRanking(userId: UserId, rankingId: RankingId): Promise<{ id: string }[]>;

  /**
   * ランキング更新
   * ランキングと、ランキングに付与する新規タグをまとめて保存する。
   * @param rankingAggregate 更新後の状態を表す集約
   * @param newTagAggregates ランキングに付与する新規タグ
   */
  updateRanking(rankingAggregate: RankingAggregate, newTagAggregates: TagAggregate[]): Promise<void>;
}
