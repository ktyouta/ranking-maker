import { and, eq, inArray, notExists } from "drizzle-orm";
import { IPermanentDeleteMyRankingRepository, ItemMemo, ItemName, Order, PublicStatus, RankingAggregate, RankingIcon, RankingId, RankingMemo, RankingOrderEntity, RankingOrderId, RankingTagEntity, RankingTagId, RankingTitle, TagId } from "../../../domain";
import { UserId } from "../../../domain/shared";
import { chunk } from "../../../util";
import { D1_MAX_IN_CLAUSE_VALUES, rankingMaster, rankingOrderMaster, rankingTagMaster, tagMaster, type Database } from "../../db";

/**
 * ランキング完全削除リポジトリ実装
 */
export class PermanentDeleteMyRankingRepository implements IPermanentDeleteMyRankingRepository {
  constructor(private readonly db: Database) { }

  /**
   * 完全削除対象のランキング集約を取得する（ゴミ箱内のみ）
   * @param userId ランキングを所有するユーザーID
   * @param rankingId 削除対象のランキングID
   * @returns 削除対象の集約（存在しない場合は null）
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
        deleteFlg: rankingOrderMaster.deleteFlg,
      })
      .from(rankingOrderMaster)
      .where(and(eq(rankingOrderMaster.deleteFlg, true), eq(rankingOrderMaster.rankingId, ranking.id)));

    const tagResult = await this.db
      .select({
        id: rankingTagMaster.id,
        tagId: rankingTagMaster.tagId,
        deleteFlg: rankingTagMaster.deleteFlg,
      })
      .from(rankingTagMaster)
      .where(and(eq(rankingTagMaster.deleteFlg, true), eq(rankingTagMaster.userId, ranking.userId), eq(rankingTagMaster.rankingId, ranking.id)));

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
          e.deleteFlg,
        )
      ),
      isDeleted: ranking.deleteFlg,
      isFavorite: ranking.isFavorite,
      rankingTagEntityList: tagResult.map((e) => new RankingTagEntity(RankingTagId.of(e.id), TagId.of(e.tagId), e.deleteFlg)),
    });
  }

  /**
   * ランキング完全削除（物理削除）
   * ランキング本体と紐づく項目・タグ付けを同時に削除し、未使用と判定されたタグも参照がないことを再確認して削除する
   * @param ranking 完全削除するランキング集約
   * @param unusedTagIds 未使用と判定されたタグ
   */
  async deleteRanking(ranking: RankingAggregate, unusedTagIds: TagId[]): Promise<void> {
    await this.db.batch([
      this.db
        .delete(rankingOrderMaster)
        .where(and(eq(rankingOrderMaster.deleteFlg, true), eq(rankingOrderMaster.rankingId, ranking.id))),
      this.db
        .delete(rankingTagMaster)
        .where(and(eq(rankingTagMaster.userId, ranking.userId), eq(rankingTagMaster.rankingId, ranking.id))),
      this.db
        .delete(rankingMaster)
        .where(and(eq(rankingMaster.deleteFlg, true), eq(rankingMaster.id, ranking.id))),
      ...chunk(unusedTagIds.map((e) => e.value), D1_MAX_IN_CLAUSE_VALUES).map((ids) =>
        this.db
          .delete(tagMaster)
          .where(and(
            eq(tagMaster.userId, ranking.userId),
            inArray(tagMaster.id, ids),
            notExists(
              this.db
                .select({ id: rankingTagMaster.id })
                .from(rankingTagMaster)
                .where(eq(rankingTagMaster.tagId, tagMaster.id))
            ),
          ))
      ),
    ]);
  }
}
