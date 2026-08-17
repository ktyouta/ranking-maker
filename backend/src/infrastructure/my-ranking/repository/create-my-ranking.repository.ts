import { and, eq } from "drizzle-orm";
import { ICreateMyRankingRepository, RankingAggregate, RankingTitle } from "../../../domain";
import { UserId } from "../../../domain/user";
import { rankingMaster, rankingOrderMaster, type Database } from "../../db";

/**
 * ランキング作成リポジトリ実装
 */
export class CreateMyRankingRepository implements ICreateMyRankingRepository {
  constructor(private readonly db: Database) { }

  /**
   * ランキングマスタ取得
   */
  async findRanking(userId: UserId, rankingTitle: RankingTitle): Promise<{ id: string }[]> {
    const result = await this.db
      .select({
        id: rankingMaster.id,
      })
      .from(rankingMaster)
      .where(and(eq(rankingMaster.deleteFlg, false), eq(rankingMaster.userId, userId.value), eq(rankingMaster.title, rankingTitle.value)));

    return result;
  }

  /**
   * ランキング作成
   * @param db 
   * @param rankingAggregate 
   */
  async createRanking(rankingAggregate: RankingAggregate) {
    const now = new Date().toISOString();
    const rankingSnapshot = rankingAggregate.toSnapshot();
    const rankingOrderEntityList = rankingSnapshot.rankingOrderEntityList;

    await this.db.batch([
      this.db.insert(rankingMaster).values({
        id: rankingSnapshot.id,
        userId: rankingSnapshot.userId,
        title: rankingSnapshot.title,
        publicStatus: rankingSnapshot.publicStatus,
        memo: rankingSnapshot.memo,
        deleteFlg: false,
        createdAt: now,
        updatedAt: now,
      }),
      ...rankingOrderEntityList.map((e) =>
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
      )
    ]);
  }
}
