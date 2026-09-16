import { RankingId } from "../../shared";
import { UserId } from "../../user";

/**
 * 一括削除対象の判定に必要な最小限の情報
 */
export type BulkSoftDeleteTargetType = {
  id: string;
  isFavorite: boolean;
};

/**
 * ランキング一括削除リポジトリインターフェース
 */
export interface IBulkSoftDeleteMyRankingRepository {
  /**
   * ランキングマスタ取得（所有権フィルタ済み・生存行のみ）
   * @param userId 所有者のユーザーID
   * @param rankingIds 取得対象のランキングID一覧
   * @returns 所有権フィルタ済みのランキング一覧
   */
  findRankings(userId: UserId, rankingIds: RankingId[]): Promise<BulkSoftDeleteTargetType[]>;

  /**
   * ランキング一括削除（論理削除）
   * @param rankingIds 削除対象のランキングID一覧（呼び出し元で所有権フィルタ済みであること）
   * @returns なし
   */
  deleteRankings(rankingIds: RankingId[]): Promise<void>;
}
