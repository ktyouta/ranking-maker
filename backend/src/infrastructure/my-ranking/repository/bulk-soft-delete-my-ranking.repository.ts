import { and, eq, inArray } from "drizzle-orm";
import { BulkSoftDeleteTargetType, IBulkSoftDeleteMyRankingRepository, RankingId } from "../../../domain";
import { UserId } from "../../../domain/user";
import { rankingMaster, rankingOrderMaster, type Database } from "../../db";

/**
 * ランキング一括削除リポジトリ実装
 */
export class BulkSoftDeleteMyRankingRepository implements IBulkSoftDeleteMyRankingRepository {
  constructor(private readonly db: Database) { }

  /**
   * ランキングマスタ取得（所有権フィルタ済み・生存行のみ）
   */
  async findRankings(userId: UserId, rankingIds: RankingId[]): Promise<BulkSoftDeleteTargetType[]> {
    return await this.db
      .select({
        id: rankingMaster.id,
        isFavorite: rankingMaster.isFavorite,
      })
      .from(rankingMaster)
      .where(and(
        eq(rankingMaster.deleteFlg, false),
        eq(rankingMaster.userId, userId.value),
        inArray(rankingMaster.id, rankingIds.map((rankingId) => rankingId.value)),
      ));
  }

  /**
   * ランキング一括削除（論理削除）
   * ランキング本体と紐づく項目を同時に削除する
   * @param rankingIds 削除対象のランキングID一覧（呼び出し元で所有権フィルタ済みであること）
   */
  async deleteRankings(rankingIds: RankingId[]): Promise<void> {
    const now = new Date().toISOString();
    const ids = rankingIds.map((rankingId) => rankingId.value);

    await this.db.batch([
      this.db
        .update(rankingMaster)
        .set({ deleteFlg: true, updatedAt: now })
        .where(and(eq(rankingMaster.deleteFlg, false), inArray(rankingMaster.id, ids))),
      this.db
        .update(rankingOrderMaster)
        .set({ deleteFlg: true, updatedAt: now })
        .where(and(eq(rankingOrderMaster.deleteFlg, false), inArray(rankingOrderMaster.rankingId, ids))),
    ]);
  }
}
