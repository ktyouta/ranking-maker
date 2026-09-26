import { and, eq } from "drizzle-orm";
import { ulid } from "ulid";
import { IUpdateMyRankingRepository, RankingAggregate, RankingId, TagAggregate } from "../../../domain";
import { UserId } from "../../../domain/shared";
import { rankingMaster, rankingOrderMaster, rankingTagMaster, tagMaster, type Database } from "../../db";

/**
 * ランキング更新リポジトリ実装
 */
export class UpdateMyRankingRepository implements IUpdateMyRankingRepository {
  constructor(private readonly db: Database) { }

  /**
   * ランキングマスタ取得
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
   * ランキング更新（全置換更新）
   * ランキング本体を上書き更新し、紐づく項目・タグ付けは物理削除＋再挿入で置き換える。
   * 新規タグはタグ付けより先に作成する。
   * @param rankingAggregate 更新後の状態を表す集約
   * @param newTagAggregates ランキングに付与する新規タグ
   */
  async updateRanking(rankingAggregate: RankingAggregate, newTagAggregates: TagAggregate[]): Promise<void> {
    const now = new Date().toISOString();
    const rankingSnapshot = rankingAggregate.toSnapshot();
    const rankingOrderList = rankingSnapshot.rankingOrderList;
    const newTagList = newTagAggregates.map((e) => e.toSnapshot());

    await this.db.batch([
      this.db
        .delete(rankingTagMaster)
        .where(and(eq(rankingTagMaster.deleteFlg, false), eq(rankingTagMaster.userId, rankingSnapshot.userId), eq(rankingTagMaster.rankingId, rankingSnapshot.id))),
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
      ...rankingSnapshot.tagIdList.map((tagId) =>
        this.db.insert(rankingTagMaster).values({
          id: ulid(),
          rankingId: rankingSnapshot.id,
          tagId,
          userId: rankingSnapshot.userId,
          deleteFlg: false,
          createdAt: now,
          updatedAt: now,
        })
      )
    ]);
  }
}
