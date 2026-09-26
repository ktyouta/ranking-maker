import { and, eq, inArray } from "drizzle-orm";
import { IBulkRestoreMyRankingRepository, ItemMemo, ItemName, Order, PublicStatus, RankingAggregate, RankingIcon, RankingId, RankingMemo, RankingOrderEntity, RankingOrderId, RankingTagEntity, RankingTagId, RankingTitle, TagId } from "../../../domain";
import { UserId } from "../../../domain/shared";
import { chunk } from "../../../util";
import { D1_MAX_IN_CLAUSE_VALUES, rankingMaster, rankingOrderMaster, rankingTagMaster, type Database } from "../../db";

/**
 * ランキング一括復元リポジトリ実装
 */
export class BulkRestoreMyRankingRepository implements IBulkRestoreMyRankingRepository {
  constructor(private readonly db: Database) { }

  /**
   * ランキングマスタ取得（所有権フィルタ済み・削除済み行のみ）
   */
  async findRankings(userId: UserId, rankingIds: RankingId[]): Promise<RankingAggregate[]> {
    const idChunks = chunk(rankingIds.map((e) => e.value), D1_MAX_IN_CLAUSE_VALUES);

    const rankingResult = (await Promise.all(idChunks.map((ids) =>
      this.db
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
        .where(and(eq(rankingMaster.deleteFlg, true), eq(rankingMaster.userId, userId.value), inArray(rankingMaster.id, ids)))
    ))).flat();

    const orderResult = (await Promise.all(idChunks.map((ids) =>
      this.db
        .select({
          id: rankingOrderMaster.id,
          rankingId: rankingOrderMaster.rankingId,
          itemName: rankingOrderMaster.itemName,
          order: rankingOrderMaster.order,
          itemMemo: rankingOrderMaster.itemMemo,
          deleteFlg: rankingOrderMaster.deleteFlg,
        })
        .from(rankingOrderMaster)
        .where(and(eq(rankingOrderMaster.deleteFlg, true), inArray(rankingOrderMaster.rankingId, ids)))
    ))).flat();

    const tagResult = (await Promise.all(idChunks.map((ids) =>
      this.db
        .select({
          rankingId: rankingTagMaster.rankingId,
          id: rankingTagMaster.id,
          tagId: rankingTagMaster.tagId,
          deleteFlg: rankingTagMaster.deleteFlg,
        })
        .from(rankingTagMaster)
        .where(and(eq(rankingTagMaster.deleteFlg, true), eq(rankingTagMaster.userId, userId.value), inArray(rankingTagMaster.rankingId, ids)))
    ))).flat();

    return rankingResult.map((ranking) => {
      const rankingOrder = orderResult.filter((order) => order.rankingId === ranking.id);
      const rankingTag = tagResult.filter((tag) => tag.rankingId === ranking.id);
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
        rankingTagEntityList: rankingTag.map((e) => new RankingTagEntity(RankingTagId.of(e.id), TagId.of(e.tagId), e.deleteFlg)),
      });
    });
  }

  /**
   * ランキング一括復元（論理削除の取り消し）
   * ランキング本体と紐づく項目・タグ付けを同時に復元する
   * 配下の項目・タグ付けには、ランキング本体と同じ集約の削除状態をランキング単位でまとめて書き込む
   * @param restorableRankings 復元対象のランキング一覧（呼び出し元で所有権フィルタ済み・restore() 実行済みであること）
   */
  async restoreRankings(restorableRankings: RankingAggregate[]): Promise<void> {
    const now = new Date().toISOString();
    const snapshots = restorableRankings.map((ranking) => ranking.toSnapshot());
    const statements = [true, false].flatMap((deleteFlg) =>
      chunk(snapshots.filter((e) => e.deleteFlg === deleteFlg).map((e) => e.id), D1_MAX_IN_CLAUSE_VALUES).flatMap((ids) => [
        this.db
          .update(rankingMaster)
          .set({ deleteFlg, updatedAt: now })
          .where(and(eq(rankingMaster.deleteFlg, !deleteFlg), inArray(rankingMaster.id, ids))),
        this.db
          .update(rankingOrderMaster)
          .set({ deleteFlg, updatedAt: now })
          .where(and(eq(rankingOrderMaster.deleteFlg, !deleteFlg), inArray(rankingOrderMaster.rankingId, ids))),
        this.db
          .update(rankingTagMaster)
          .set({ deleteFlg, updatedAt: now })
          .where(and(eq(rankingTagMaster.deleteFlg, !deleteFlg), inArray(rankingTagMaster.rankingId, ids))),
      ])
    );

    const [firstStatement, ...restStatements] = statements;
    if (!firstStatement) {
      return;
    }

    await this.db.batch([firstStatement, ...restStatements]);
  }
}
