import { and, eq } from "drizzle-orm";
import { type IUpdateFavoriteMyRankingRepository, ItemMemo, ItemName, Order, PublicStatus, RankingAggregate, RankingIcon, RankingId, RankingMemo, RankingOrderEntity, RankingOrderId, RankingTagEntity, RankingTagId, RankingTitle, TagId } from "../../../../domain";
import { UserId } from "../../../../domain/shared";
import { rankingMaster, rankingOrderMaster, rankingTagMaster, type Database } from "../../../db";

/**
 * お気に入り更新リポジトリ実装
 */
export class UpdateFavoriteMyRankingRepository implements IUpdateFavoriteMyRankingRepository {
  constructor(private readonly db: Database) { }

  /**
   * ランキング取得（削除されていないランキングのみ）
   * @param userId 所有するユーザーID
   * @param rankingId 取得対象のランキングID
   * @returns ランキング集約（存在しない・削除済みの場合は null）
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

    const tagResult = await this.db
      .select({
        id: rankingTagMaster.id,
        tagId: rankingTagMaster.tagId,
        deleteFlg: rankingTagMaster.deleteFlg,
      })
      .from(rankingTagMaster)
      .where(and(eq(rankingTagMaster.deleteFlg, false), eq(rankingTagMaster.userId, ranking.userId), eq(rankingTagMaster.rankingId, ranking.id)));

    return RankingAggregate.reconstruct({
      rankingId: RankingId.of(ranking.id),
      rankingTitle: RankingTitle.of(ranking.title),
      publicStatus: PublicStatus.of(ranking.publicStatus),
      icon: RankingIcon.of(ranking.icon),
      memo: RankingMemo.of(ranking.memo),
      userId: UserId.of(ranking.userId),
      rankingOrderEntityList: orderResult.map((e) =>
        new RankingOrderEntity(
          RankingOrderId.of(e.id),
          ItemName.of(e.itemName),
          Order.of(e.order),
          ItemMemo.of(e.itemMemo ?? ""),
          e.deleteFlg
        )
      ),
      isDeleted: ranking.deleteFlg,
      isFavorite: ranking.isFavorite,
      rankingTagEntityList: tagResult.map((e) => new RankingTagEntity(RankingTagId.of(e.id), TagId.of(e.tagId), e.deleteFlg)),
    });
  }

  /**
   * お気に入り状態を保存する
   * 保存までの間に削除されたランキングは更新しない
   * @param ranking お気に入り状態を変更したランキング集約
   */
  async updateFavorite(ranking: RankingAggregate): Promise<void> {
    const now = new Date().toISOString();
    const rankingSnapshot = ranking.toSnapshot();

    await this.db
      .update(rankingMaster)
      .set({ isFavorite: rankingSnapshot.isFavorite, updatedAt: now })
      .where(and(eq(rankingMaster.deleteFlg, false), eq(rankingMaster.id, rankingSnapshot.id)));
  }
}
