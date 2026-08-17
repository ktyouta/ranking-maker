import { and, eq } from "drizzle-orm";
import { IRestoreMyRankingRepository, ItemMemo, ItemName, Order, PublicStatus, RankingAggregate, RankingId, RankingMemo, RankingOrderEntity, RankingOrderId, RankingTitle } from "../../../domain";
import { UserId } from "../../../domain/user";
import { rankingMaster, rankingOrderMaster, type Database } from "../../db";

/**
 * ランキング復元リポジトリ実装
 */
export class RestoreMyRankingRepository implements IRestoreMyRankingRepository {
  constructor(private readonly db: Database) { }

  /**
   * 削除済みランキング取得（集約として再構築する）
   */
  async findRanking(userId: UserId, rankingId: RankingId): Promise<RankingAggregate | null> {
    const rankingResult = await this.db
      .select({
        id: rankingMaster.id,
        userId: rankingMaster.userId,
        title: rankingMaster.title,
        publicStatus: rankingMaster.publicStatus,
        memo: rankingMaster.memo,
        deleteFlg: rankingMaster.deleteFlg,
      })
      .from(rankingMaster)
      .where(and(eq(rankingMaster.deleteFlg, true), eq(rankingMaster.userId, userId.value), eq(rankingMaster.id, rankingId.value)));

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
      })
      .from(rankingOrderMaster)
      .where(and(eq(rankingOrderMaster.deleteFlg, true), eq(rankingOrderMaster.rankingId, ranking.id)));

    return RankingAggregate.reconstruct({
      rankingId: RankingId.of(ranking.id),
      rankingTitle: new RankingTitle(ranking.title),
      publicStatus: new PublicStatus(ranking.publicStatus),
      memo: new RankingMemo(ranking.memo),
      userId: UserId.of(ranking.userId),
      rankingOrderEntityList: orderResult.map((e) =>
        new RankingOrderEntity(
          RankingOrderId.of(e.id),
          new ItemName(e.itemName),
          new Order(e.order),
          new ItemMemo(e.itemMemo ?? ""),
        )
      ),
      isDeleted: ranking.deleteFlg,
    });
  }

  /**
   * ランキング復元
   * @param rankingAggregate 復元後の状態を表す集約
   */
  async restoreRanking(rankingAggregate: RankingAggregate): Promise<void> {
    const now = new Date().toISOString();
    const rankingSnapshot = rankingAggregate.toSnapshot();

    await this.db.batch([
      this.db
        .update(rankingMaster)
        .set({
          deleteFlg: rankingSnapshot.deleteFlg,
          updatedAt: now,
        })
        .where(and(eq(rankingMaster.deleteFlg, true), eq(rankingMaster.userId, rankingSnapshot.userId), eq(rankingMaster.id, rankingSnapshot.id))),
      this.db
        .update(rankingOrderMaster)
        .set({
          deleteFlg: rankingSnapshot.deleteFlg,
          updatedAt: now,
        })
        .where(and(eq(rankingOrderMaster.deleteFlg, true), eq(rankingOrderMaster.rankingId, rankingSnapshot.id))),
    ]);
  }
}
