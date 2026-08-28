import { and, eq } from "drizzle-orm";
import { IGetMyRankingRepository, RankingId, MyRankingOrderType, MyRankingType } from "../../../domain";
import { UserId } from "../../../domain/user";
import { publicStatusMaster, rankingMaster, rankingOrderMaster, type Database } from "../../db";

/**
 * ランキング取得リポジトリ実装
 */
export class GetMyRankingRepository implements IGetMyRankingRepository {
  constructor(private readonly db: Database) { }

  /**
   * ランキングマスタ取得
   */
  async findRanking(userId: UserId, rankingId: RankingId): Promise<MyRankingType | null> {
    const result = await this.db
      .select({
        id: rankingMaster.id,
        title: rankingMaster.title,
        createdAt: rankingMaster.createdAt,
        updatedAt: rankingMaster.updatedAt,
        publicStatus: rankingMaster.publicStatus,
        publicStatusName: publicStatusMaster.name
      })
      .from(rankingMaster)
      .innerJoin(publicStatusMaster, eq(publicStatusMaster.id, rankingMaster.publicStatus))
      .where(and(eq(rankingMaster.deleteFlg, false), eq(rankingMaster.userId, userId.value), eq(rankingMaster.id, rankingId.value)));

    if (!result[0]) {
      return null;
    }

    return result[0];
  }

  /**
   * ランキングオーダー取得
   * @param rankingId 
   */
  async findRankingOrder(rankingId: RankingId): Promise<MyRankingOrderType[]> {
    return await this.db
      .select({
        id: rankingOrderMaster.id,
        itemName: rankingOrderMaster.itemName,
        itemMemo: rankingOrderMaster.itemMemo,
        createdAt: rankingOrderMaster.createdAt,
      })
      .from(rankingOrderMaster)
      .where(and(eq(rankingOrderMaster.deleteFlg, false), eq(rankingOrderMaster.rankingId, rankingId.value)));
  }
}
