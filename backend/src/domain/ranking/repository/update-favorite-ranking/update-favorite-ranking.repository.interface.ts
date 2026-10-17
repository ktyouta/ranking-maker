import { RankingId, UserId } from "../../../shared";
import { RankingAggregate } from "../../aggregate";

/**
 * お気に入り更新リポジトリインターフェース
 */
export interface IUpdateFavoriteRankingRepository {
  /**
   * ランキング取得（削除されていないランキングのみ）
   * @param userId 所有するユーザーID
   * @param rankingId 取得対象のランキングID
   * @returns ランキング集約（存在しない・削除済みの場合は null）
   */
  findRanking(userId: UserId, rankingId: RankingId): Promise<RankingAggregate | null>;

  /**
   * お気に入り状態を保存する
   * @param ranking お気に入り状態を変更したランキング集約
   */
  updateFavorite(ranking: RankingAggregate): Promise<void>;
}
