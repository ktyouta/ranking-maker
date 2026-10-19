import { type ICreateRankingRepository, RankingAggregate, TagAggregate } from "../../../../domain";
import { rankingMaster, rankingOrderMaster, rankingTagMaster, tagMaster, type Database } from "../../../db";

/**
 * ランキング作成リポジトリ実装
 */
export class CreateRankingRepository implements ICreateRankingRepository {
  constructor(private readonly db: Database) { }

  /**
   * ランキング作成
   * @param rankingAggregate
   * @param newTagAggregates ランキングに付与する新規タグ
   */
  async createRanking(rankingAggregate: RankingAggregate, newTagAggregates: TagAggregate[]) {
    const now = new Date().toISOString();
    const rankingSnapshot = rankingAggregate.toSnapshot();
    const rankingOrderList = rankingSnapshot.rankingOrderList;
    const newTagList = newTagAggregates.map((e) => e.toSnapshot());

    await this.db.batch([
      this.db.insert(rankingMaster).values({
        id: rankingSnapshot.id,
        userId: rankingSnapshot.userId,
        title: rankingSnapshot.title,
        publicStatus: rankingSnapshot.publicStatus,
        icon: rankingSnapshot.icon,
        memo: rankingSnapshot.memo,
        deleteFlg: false,
        createdAt: now,
        updatedAt: now,
      }),
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
      )
    ]);
  }
}
