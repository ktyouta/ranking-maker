import { RankingId } from "../../shared/value-object/ranking-id";
import { UserId } from "../../user";


/**
 * ランキング削除リポジトリインターフェース
 */
export interface ISoftDeleteMyRankingRepository {
  /**
   * ランキングマスタ取得
   */
  findRanking(userId: UserId, rankingId: RankingId): Promise<{ id: string }[]>;

  /**
   * ランキング削除
   * @param rankingId 
   */
  deleteRanking(rankingId: RankingId): Promise<void>;
}
