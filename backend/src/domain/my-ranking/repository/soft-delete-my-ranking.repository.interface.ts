import { RankingId } from "../../shared";
import { UserId } from "../../user";
import { RankingAggregate } from "../aggregate";


/**
 * ランキング削除リポジトリインターフェース
 */
export interface ISoftDeleteMyRankingRepository {
  /**
   * ランキングマスタ取得
   */
  findRanking(userId: UserId, rankingId: RankingId): Promise<RankingAggregate | null>;

  /**
   * ランキング削除
   * @param ranking 
   */
  deleteRanking(ranking: RankingAggregate): Promise<void>;
}
