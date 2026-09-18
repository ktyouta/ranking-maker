import { and, eq } from "drizzle-orm";
import { ISoftDeleteMyRankingRepository, ItemMemo, ItemName, Order, PublicStatus, RankingAggregate, RankingIcon, RankingId, RankingMemo, RankingOrderEntity, RankingOrderId, RankingTitle } from "../../../domain";
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
  async findRanking(userId: UserId, rankingId: RankingId): Promise<RankingAggregate | null> {
    const rankingResult = await this.db
      .select({
        id: rankingMaster.id,
        userId: rankingMaster.userId,
        title: rankingMaster.title,
        publicStatus: rankingMaster.publicStatus,
        icon: rankingMaster.icon,
        memo: rankingMaster.memo,
        deleteFlg: rankingMaster.deleteFlg,
        isFavorite: rankingMaster.isFavorite,
      })
      .from(rankingMaster)
      .where(and(eq(rankingMaster.deleteFlg, false), eq(rankingMaster.userId, userId.value), eq(rankingMaster.id, rankingId.value)));

    const ranking = rankingResult[0];
    if (!ranking) {
      return null;
    }

    const orderResult = await this.db
      .select({
        id: rankingOrderMaster.id,
        itemName: rankingOrderMaster.itemName,
        order: rankingOrderMaster.order,
        itemMemo: rankingOrderMaster.itemMemo,
        deleteFlg: rankingOrderMaster.deleteFlg,
      })
      .from(rankingOrderMaster)
      .where(and(eq(rankingOrderMaster.deleteFlg, false), eq(rankingOrderMaster.rankingId, ranking.id)));

    return RankingAggregate.reconstruct({
      rankingId: RankingId.of(ranking.id),
      rankingTitle: new RankingTitle(ranking.title),
      publicStatus: new PublicStatus(ranking.publicStatus),
      icon: new RankingIcon(ranking.icon),
      memo: new RankingMemo(ranking.memo),
      userId: UserId.of(ranking.userId),
      rankingOrderEntityList: orderResult.map((e) =>
        new RankingOrderEntity(
          RankingOrderId.of(e.id),
          new ItemName(e.itemName),
          new Order(e.order),
          new ItemMemo(e.itemMemo ?? ""),
          e.deleteFlg
        )
      ),
      isDeleted: ranking.deleteFlg,
      isFavorite: ranking.isFavorite,
    });
  }

  /**
   * ランキング削除（論理削除）
   * ランキング本体と紐づく項目を同時に削除する
   * @param rankingId
   */
  async deleteRanking(ranking: RankingAggregate): Promise<void> {
    const now = new Date().toISOString();

    await this.db.batch([
      this.db
        .update(rankingMaster)
        .set({ deleteFlg: true, updatedAt: now })
        .where(and(eq(rankingMaster.deleteFlg, false), eq(rankingMaster.id, ranking.id))),
      this.db
        .update(rankingOrderMaster)
        .set({ deleteFlg: true, updatedAt: now })
        .where(and(eq(rankingOrderMaster.deleteFlg, false), eq(rankingOrderMaster.rankingId, ranking.id))),
    ]);
  }
}
