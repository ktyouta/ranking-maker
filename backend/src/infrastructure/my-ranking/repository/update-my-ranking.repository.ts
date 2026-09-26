import { and, eq, inArray, notExists } from "drizzle-orm";
import { ItemMemo, ItemName, IUpdateMyRankingRepository, Order, PublicStatus, RankingAggregate, RankingIcon, RankingId, RankingMemo, RankingOrderEntity, RankingOrderId, RankingTagEntity, RankingTagId, RankingTitle, TagAggregate, TagId } from "../../../domain";
import { UserId } from "../../../domain/shared";
import { chunk } from "../../../util";
import { D1_MAX_IN_CLAUSE_VALUES, rankingMaster, rankingOrderMaster, rankingTagMaster, tagMaster, type Database } from "../../db";

/**
 * ランキング更新リポジトリ実装
 */
export class UpdateMyRankingRepository implements IUpdateMyRankingRepository {
  constructor(private readonly db: Database) { }

  /**
   * 更新対象のランキング集約を取得する（生存行のみ）
   * @param userId ランキングを所有するユーザーID
   * @param rankingId 更新対象のランキングID
   * @returns 更新前の集約（存在しない場合は null）
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
   * ランキング更新（全置換更新）
   * ランキング本体を上書き更新し、紐づく項目・タグ付けは物理削除＋再挿入で置き換える。
   * 新規タグはタグ付けより先に作成し、未使用と判定されたタグは参照がないことを再確認して削除する。
   * @param rankingAggregate 更新後の状態を表す集約
   * @param newTagAggregates ランキングに付与する新規タグ
   * @param unusedTagIds 未使用と判定されたタグ
   */
  async updateRanking(rankingAggregate: RankingAggregate, newTagAggregates: TagAggregate[], unusedTagIds: TagId[]): Promise<void> {
    const now = new Date().toISOString();
    const rankingSnapshot = rankingAggregate.toSnapshot();
    const rankingOrderList = rankingSnapshot.rankingOrderList;
    const newTagList = newTagAggregates.map((e) => e.toSnapshot());

    await this.db.batch([
      this.db
        .delete(rankingTagMaster)
        .where(and(eq(rankingTagMaster.userId, rankingSnapshot.userId), eq(rankingTagMaster.rankingId, rankingSnapshot.id))),
      ...newTagList.map((e) =>
        this.db.insert(tagMaster).values({
          id: e.id,
          userId: e.userId,
          name: e.name,
          deleteFlg: false,
          createdAt: now,
          updatedAt: now,
        })
      ),
      // 既存の項目は物理削除して総入れ替えする（項目行はソフト削除しない運用のため deleteFlg=false のみ対象）
      this.db
        .delete(rankingOrderMaster)
        .where(and(eq(rankingOrderMaster.deleteFlg, false), eq(rankingOrderMaster.rankingId, rankingSnapshot.id))),
      this.db
        .update(rankingMaster)
        .set({
          title: rankingSnapshot.title,
          memo: rankingSnapshot.memo,
          publicStatus: rankingSnapshot.publicStatus,
          icon: rankingSnapshot.icon,
          updatedAt: now
        })
        .where(and(eq(rankingMaster.deleteFlg, false), eq(rankingMaster.userId, rankingSnapshot.userId), eq(rankingMaster.id, rankingSnapshot.id))),
      ...rankingOrderList.map((e) =>
        this.db.insert(rankingOrderMaster).values({
          id: e.id,
          rankingId: rankingSnapshot.id,
          order: e.order,
          itemName: e.itemName,
          itemMemo: e.memo,
          deleteFlg: false,
          createdAt: now,
          updatedAt: now,
        })
      ),
      ...rankingSnapshot.rankingTagList.map((e) =>
        this.db.insert(rankingTagMaster).values({
          id: e.id,
          rankingId: rankingSnapshot.id,
          tagId: e.tagId,
          userId: rankingSnapshot.userId,
          deleteFlg: false,
          createdAt: now,
          updatedAt: now,
        })
      ),
      ...chunk(unusedTagIds.map((e) => e.value), D1_MAX_IN_CLAUSE_VALUES).map((ids) =>
        this.db
          .delete(tagMaster)
          .where(and(
            eq(tagMaster.userId, rankingSnapshot.userId),
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
