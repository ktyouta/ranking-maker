import { RankingId, UserId } from "../../shared";
import { RankingAggregate } from "../aggregate";

/**
 * ランキング一括復元リポジトリインターフェース
 */
export interface IBulkRestoreMyRankingRepository {
  /**
   * ランキングマスタ取得（所有権フィルタ済み・削除済み行のみ）
   * @param userId 所有者のユーザーID
   * @param rankingIds 取得対象のランキングID一覧
   * @returns 所有権フィルタ済みのランキング一覧
   */
  findRankings(userId: UserId, rankingIds: RankingId[]): Promise<RankingAggregate[]>;

  /**
   * ランキング一括復元（論理削除の取り消し）
   * @param restorableRankings 復元対象のランキング一覧（呼び出し元で所有権フィルタ済みであること）
   * @returns なし
   */
  restoreRankings(restorableRankings: RankingAggregate[]): Promise<void>;
}
