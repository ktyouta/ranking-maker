import { and, eq } from "drizzle-orm";
import { ISoftDeleteMyRankingRepository } from "../../../domain/my-ranking/repository";
import { RankingId } from "../../../domain/shared/value-object/ranking-id";
import { UserId } from "../../../domain/user";
import { rankingMaster, rankingOrderMaster, type Database } from "../../db";

/**
 * ランキング削除リポジトリ実装
 */
export class SoftDeleteMyRankingRepository implements ISoftDeleteMyRankingRepository {
  constructor(private readonly db: Database) { }

  /**
   * ランキングマスタ取得
   */
  async findRanking(userId: UserId, rankingId: RankingId): Promise<{ id: string }[]> {
    const result = await this.db
      .select({
        id: rankingMaster.id,
      })
      .from(rankingMaster)
      .where(and(eq(rankingMaster.deleteFlg, false), eq(rankingMaster.userId, userId.value), eq(rankingMaster.id, rankingId.value)));

    return result;
  }

  /**
   * ランキング削除（論理削除）
   * ランキング本体と紐づく項目を同時に削除する
   * @param rankingId
   */
  async deleteRanking(rankingId: RankingId): Promise<void> {
    const now = new Date().toISOString();

    await this.db.batch([
      this.db
        .update(rankingMaster)
        .set({ deleteFlg: true, updatedAt: now })
        .where(and(eq(rankingMaster.deleteFlg, false), eq(rankingMaster.id, rankingId.value))),
      this.db
        .update(rankingOrderMaster)
        .set({ deleteFlg: true, updatedAt: now })
        .where(and(eq(rankingOrderMaster.deleteFlg, false), eq(rankingOrderMaster.rankingId, rankingId.value))),
    ]);
  }
}
