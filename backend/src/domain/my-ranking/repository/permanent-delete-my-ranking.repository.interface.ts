import { RankingId, UserId } from "../../shared";
import { RankingAggregate } from "../aggregate";
import { TagId } from "../value-object";

/**
 * ランキング完全削除リポジトリインターフェース
 */
export interface IPermanentDeleteMyRankingRepository {
  /**
   * 完全削除対象のランキング集約を取得する（ゴミ箱内のみ）
   * @param userId ランキングを所有するユーザーID
   * @param rankingId 削除対象のランキングID
   * @returns 削除対象の集約（存在しない場合は null）
   */
  findRanking(userId: UserId, rankingId: RankingId): Promise<RankingAggregate | null>;

  /**
   * ランキング完全削除
   * 未使用と判定されたタグもあわせて削除する。判定後に他のランキングへ紐づいたタグは削除しない。
   * @param ranking 完全削除するランキング集約
   * @param unusedTagIds 未使用と判定されたタグ
   */
  deleteRanking(ranking: RankingAggregate, unusedTagIds: TagId[]): Promise<void>;
}
