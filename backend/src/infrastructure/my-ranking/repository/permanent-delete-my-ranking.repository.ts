import { and, eq } from "drizzle-orm";
import { IPermanentDeleteMyRankingRepository, RankingId } from "../../../domain";
import { UserId } from "../../../domain/user";
import { rankingMaster, rankingOrderMaster, type Database } from "../../db";

/**
 * ランキング完全削除リポジトリ実装
 */
export class PermanentDeleteMyRankingRepository implements IPermanentDeleteMyRankingRepository {
  constructor(private readonly db: Database) { }

  /**
   * ランキングマスタ取得（ゴミ箱内のみ）
   */
  async findRanking(userId: UserId, rankingId: RankingId): Promise<{ id: string }[]> {
    const result = await this.db
      .select({
        id: rankingMaster.id,
      })
      .from(rankingMaster)
      .where(and(eq(rankingMaster.deleteFlg, true), eq(rankingMaster.userId, userId.value), eq(rankingMaster.id, rankingId.value)));

    return result;
  }

  /**
   * ランキング完全削除（物理削除）
   * ランキング本体と紐づく項目を同時に削除する
   * @param rankingId
   */
  async deleteRanking(rankingId: RankingId): Promise<void> {
    await this.db.batch([
      this.db
        .delete(rankingOrderMaster)
        .where(and(eq(rankingOrderMaster.deleteFlg, true), eq(rankingOrderMaster.rankingId, rankingId.value))),
      this.db
        .delete(rankingMaster)
        .where(and(eq(rankingMaster.deleteFlg, true), eq(rankingMaster.id, rankingId.value))),
    ]);
  }
}
