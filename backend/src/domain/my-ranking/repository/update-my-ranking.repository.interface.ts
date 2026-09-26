import { RankingAggregate, TagAggregate } from "../aggregate";
import { RankingId, UserId } from "../../shared";
import { TagId } from "../value-object";


/**
 * ランキング更新リポジトリインターフェース
 */
export interface IUpdateMyRankingRepository {
  /**
   * 更新対象のランキング集約を取得する（生存行のみ）
   * @param userId ランキングを所有するユーザーID
   * @param rankingId 更新対象のランキングID
   * @returns 更新前の集約（存在しない場合は null）
   */
  findRanking(userId: UserId, rankingId: RankingId): Promise<RankingAggregate | null>;

  /**
   * ランキング更新
   * ランキングと、ランキングに付与する新規タグをまとめて保存する。
   * 未使用と判定されたタグを削除する。判定後に他のランキングへ紐づいたタグは削除しない。
   * @param rankingAggregate 更新後の状態を表す集約
   * @param newTagAggregates ランキングに付与する新規タグ
   * @param unusedTagIds 未使用と判定されたタグ
   */
  updateRanking(rankingAggregate: RankingAggregate, newTagAggregates: TagAggregate[], unusedTagIds: TagId[]): Promise<void>;
}
