import { RankingId, UserId } from "../../shared";

/**
 * お気に入り更新リポジトリインターフェース
 */
export interface IUpdateFavoriteMyRankingRepository {
  /**
   * ランキングマスタ取得（所有権確認用）
   */
  findRanking(userId: UserId, rankingId: RankingId): Promise<{ id: string }[]>;

  /**
   * お気に入り状態を更新する
   * @param rankingId 更新対象のランキングID
   * @param isFavorite 更新後のお気に入り状態
   */
  updateFavorite(rankingId: RankingId, isFavorite: boolean): Promise<void>;
}
