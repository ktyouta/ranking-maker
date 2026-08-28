import { UserId } from "../../user";
import { RankingAggregate } from "../aggregate";
import { RankingId } from "../../shared";

/**
 * ランキング復元リポジトリインターフェース
 */
export interface IRestoreMyRankingRepository {
  /**
   * 削除済みランキング取得（所有者が一致する削除済みランキングを集約として再構築する）
   */
  findRanking(userId: UserId, rankingId: RankingId): Promise<RankingAggregate | null>;

  /**
   * ランキング復元
   * @param rankingAggregate 復元後の状態を表す集約
   */
  restoreRanking(rankingAggregate: RankingAggregate): Promise<void>;
}
