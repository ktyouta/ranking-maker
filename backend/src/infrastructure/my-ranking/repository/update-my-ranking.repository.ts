import { and, eq } from "drizzle-orm";
import { IUpdateMyRankingRepository, RankingAggregate, RankingId } from "../../../domain";
import { UserId } from "../../../domain/user";
import { rankingMaster, rankingOrderMaster, type Database } from "../../db";

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
   * ランキング本体を上書き更新し、紐づく項目は物理削除＋再挿入で置き換える。
   * @param rankingAggregate 更新後の状態を表す集約
   */
  async updateRanking(rankingAggregate: RankingAggregate): Promise<void> {
    const now = new Date().toISOString();
    const rankingOrderEntityList = rankingAggregate.rankingOrderEntityList;

    await this.db.batch([
      // 既存の項目は物理削除して総入れ替えする（項目行はソフト削除しない運用のため deleteFlg=false のみ対象）
      this.db
        .delete(rankingOrderMaster)
        .where(and(eq(rankingOrderMaster.deleteFlg, false), eq(rankingOrderMaster.rankingId, rankingAggregate.id))),
      this.db
        .update(rankingMaster)
        .set({
          title: rankingAggregate.title,
          memo: rankingAggregate.memo,
          publicStatus: rankingAggregate.publicStatus,
          updatedAt: now
        })
        .where(and(eq(rankingMaster.deleteFlg, false), eq(rankingMaster.userId, rankingAggregate.userId), eq(rankingMaster.id, rankingAggregate.id))),
      ...rankingOrderEntityList.map((e) =>
        this.db.insert(rankingOrderMaster).values({
          id: e.id,
          rankingId: rankingAggregate.id,
          order: e.order,
          itemName: e.itemName,
          itemMemo: e.memo,
          deleteFlg: false,
          createdAt: now,
          updatedAt: now,
        })
      )
    ]);
  }
}
