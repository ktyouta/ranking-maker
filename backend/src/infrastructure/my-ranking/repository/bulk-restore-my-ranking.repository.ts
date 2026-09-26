import { and, eq, inArray } from "drizzle-orm";
import { IBulkRestoreMyRankingRepository, ItemMemo, ItemName, Order, PublicStatus, RankingAggregate, RankingIcon, RankingId, RankingMemo, RankingOrderEntity, RankingOrderId, RankingTitle } from "../../../domain";
import { UserId } from "../../../domain/shared";
import { rankingMaster, rankingOrderMaster, type Database } from "../../db";

/**
 * ランキング一括復元リポジトリ実装
 */
export class BulkRestoreMyRankingRepository implements IBulkRestoreMyRankingRepository {
  constructor(private readonly db: Database) { }

  /**
   * ランキングマスタ取得（所有権フィルタ済み・削除済み行のみ）
   */
  async findRankings(userId: UserId, rankingIds: RankingId[]): Promise<RankingAggregate[]> {
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
      .where(and(eq(rankingMaster.deleteFlg, true), eq(rankingMaster.userId, userId.value), inArray(rankingMaster.id, rankingIds.map((e) => e.value))));

    const orderResult = await this.db
      .select({
        id: rankingOrderMaster.id,
        rankingId: rankingOrderMaster.rankingId,
        itemName: rankingOrderMaster.itemName,
        order: rankingOrderMaster.order,
        itemMemo: rankingOrderMaster.itemMemo,
        deleteFlg: rankingOrderMaster.deleteFlg,
      })
      .from(rankingOrderMaster)
      .where(and(eq(rankingOrderMaster.deleteFlg, true), inArray(rankingOrderMaster.rankingId, rankingIds.map((e) => e.value))));

    return rankingResult.map((ranking) => {
      const rankingOrder = orderResult.filter((order) => order.rankingId === ranking.id);
      return RankingAggregate.reconstruct({
        rankingId: RankingId.of(ranking.id),
        rankingTitle: new RankingTitle(ranking.title),
        publicStatus: new PublicStatus(ranking.publicStatus),
        icon: new RankingIcon(ranking.icon),
        memo: new RankingMemo(ranking.memo),
        userId: UserId.of(ranking.userId),
        rankingOrderEntityList: rankingOrder.map((e) =>
          new RankingOrderEntity(
            RankingOrderId.of(e.id),
            new ItemName(e.itemName),
            new Order(e.order),
            new ItemMemo(e.itemMemo ?? ""),
            e.deleteFlg,
          )
        ),
        isDeleted: ranking.deleteFlg,
        isFavorite: ranking.isFavorite,
        tagIdList: [],
      });
    });
  }

  /**
   * ランキング一括復元（論理削除の取り消し）
   * ランキング本体と紐づく項目を同時に復元する
   * @param restorableRankings 復元対象のランキング一覧（呼び出し元で所有権フィルタ済み・restore() 実行済みであること）
   */
  async restoreRankings(restorableRankings: RankingAggregate[]): Promise<void> {
    const now = new Date().toISOString();
    const ids = restorableRankings.map((ranking) => ranking.id);

    await this.db.batch([
      this.db
        .update(rankingMaster)
        .set({ deleteFlg: false, updatedAt: now })
        .where(and(eq(rankingMaster.deleteFlg, true), inArray(rankingMaster.id, ids))),
      this.db
        .update(rankingOrderMaster)
        .set({ deleteFlg: false, updatedAt: now })
        .where(and(eq(rankingOrderMaster.deleteFlg, true), inArray(rankingOrderMaster.rankingId, ids))),
    ]);
  }
}
