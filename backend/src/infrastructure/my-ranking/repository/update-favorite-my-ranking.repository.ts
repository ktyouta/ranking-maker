import { and, eq } from "drizzle-orm";
import { IUpdateFavoriteMyRankingRepository, RankingId } from "../../../domain";
import { UserId } from "../../../domain/shared";
import { rankingMaster, type Database } from "../../db";

/**
 * お気に入り更新リポジトリ実装
 */
export class UpdateFavoriteMyRankingRepository implements IUpdateFavoriteMyRankingRepository {
  constructor(private readonly db: Database) { }

  /**
   * ランキングマスタ取得（所有権確認用）
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
   * お気に入り状態を更新する
   * @param rankingId 更新対象のランキングID
   * @param isFavorite 更新後のお気に入り状態
   */
  async updateFavorite(rankingId: RankingId, isFavorite: boolean): Promise<void> {
    const now = new Date().toISOString();

    await this.db
      .update(rankingMaster)
      .set({ isFavorite, updatedAt: now })
      .where(and(eq(rankingMaster.deleteFlg, false), eq(rankingMaster.id, rankingId.value)));
  }
}
