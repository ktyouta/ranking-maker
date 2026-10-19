import { RankingId, UserId } from "../../../shared";
import { RankingAggregate } from "../../aggregate";

/**
 * ランキング一括削除リポジトリインターフェース
 */
export interface IBulkSoftDeleteRankingRepository {
  /**
   * ランキングマスタ取得（所有権フィルタ済み・生存行のみ）
   * @param userId 所有者のユーザーID
   * @param rankingIds 取得対象のランキングID一覧
   * @returns 所有権フィルタ済みのランキング一覧
   */
  findRankings(userId: UserId, rankingIds: RankingId[]): Promise<RankingAggregate[]>;

  /**
   * ランキング一括削除（論理削除）
   * @param deletableRankings 削除対象のランキング一覧（呼び出し元で所有権フィルタ済みであること）
   * @returns なし
   */
  deleteRankings(deletableRankings: RankingAggregate[]): Promise<void>;
}
