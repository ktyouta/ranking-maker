import { and, eq, inArray } from "drizzle-orm";
import { IBulkSoftDeleteMyRankingRepository, ItemMemo, ItemName, Order, PublicStatus, RankingAggregate, RankingIcon, RankingId, RankingMemo, RankingOrderEntity, RankingOrderId, RankingTitle } from "../../../domain";
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
      .where(and(eq(rankingMaster.deleteFlg, false), eq(rankingMaster.userId, userId.value), inArray(rankingMaster.id, rankingIds.map((e) => e.value))));

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
      .where(and(eq(rankingOrderMaster.deleteFlg, false), inArray(rankingOrderMaster.rankingId, rankingIds.map((e) => e.value))));

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
      });
    });
  }

  /**
   * ランキング一括削除（論理削除）
   * ランキング本体と紐づく項目を同時に削除する
   * @param rankings 削除対象のランキング一覧（呼び出し元で所有権フィルタ済み・delete() 実行済みであること）
   */
  async deleteRankings(rankings: RankingAggregate[]): Promise<void> {
    const now = new Date().toISOString();
    const ids = rankings.filter((ranking) => ranking.isDeleted()).map((ranking) => ranking.id);

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
