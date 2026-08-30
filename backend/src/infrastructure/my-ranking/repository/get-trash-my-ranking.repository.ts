import { and, eq } from "drizzle-orm";
import { IGetTrashMyRankingRepository, RankingId, MyRankingOrderType, MyRankingType } from "../../../domain";
import { UserId } from "../../../domain/user";
import { publicStatusMaster, rankingMaster, rankingOrderMaster, type Database } from "../../db";

/**
 * ゴミ箱のランキング取得リポジトリ実装
 */
export class GetTrashMyRankingRepository implements IGetTrashMyRankingRepository {
  constructor(private readonly db: Database) { }

  /**
   * ランキングマスタ取得（削除済みのみ）
   */
  async findRanking(userId: UserId, rankingId: RankingId): Promise<MyRankingType | null> {
    const result = await this.db
      .select({
        id: rankingMaster.id,
        title: rankingMaster.title,
        memo: rankingMaster.memo,
        createdAt: rankingMaster.createdAt,
        updatedAt: rankingMaster.updatedAt,
        publicStatus: rankingMaster.publicStatus,
        publicStatusName: publicStatusMaster.name
      })
      .from(rankingMaster)
      .innerJoin(publicStatusMaster, eq(publicStatusMaster.id, rankingMaster.publicStatus))
      .where(and(eq(rankingMaster.deleteFlg, true), eq(rankingMaster.userId, userId.value), eq(rankingMaster.id, rankingId.value)));

    if (!result[0]) {
      return null;
    }

    return result[0];
  }

  /**
   * ランキングオーダー取得（削除済みのみ）
   * @param rankingId
   */
  async findRankingOrder(rankingId: RankingId): Promise<MyRankingOrderType[]> {
    return await this.db
      .select({
        id: rankingOrderMaster.id,
        itemName: rankingOrderMaster.itemName,
        itemMemo: rankingOrderMaster.itemMemo,
        order: rankingOrderMaster.order,
        createdAt: rankingOrderMaster.createdAt,
      })
      .from(rankingOrderMaster)
      .where(and(eq(rankingOrderMaster.deleteFlg, true), eq(rankingOrderMaster.rankingId, rankingId.value)))
      .orderBy(rankingOrderMaster.order);
  }
}
