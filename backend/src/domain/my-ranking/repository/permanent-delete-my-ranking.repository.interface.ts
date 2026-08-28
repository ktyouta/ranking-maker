import { RankingId } from "../../shared";
import { UserId } from "../../user";

/**
 * ランキング完全削除リポジトリインターフェース
 */
export interface IPermanentDeleteMyRankingRepository {
  /**
   * ランキングマスタ取得（ゴミ箱内のみ）
   */
  findRanking(userId: UserId, rankingId: RankingId): Promise<{ id: string }[]>;

  /**
   * ランキング完全削除
   * @param rankingId
   */
  deleteRanking(rankingId: RankingId): Promise<void>;
}
