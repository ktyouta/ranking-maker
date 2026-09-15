import { and, eq, inArray } from "drizzle-orm";
import { IGetMyRankingExportRepository, RankingId, MyRankingExportOrderType, MyRankingExportType } from "../../../domain";
import { UserId } from "../../../domain/user";
import { rankingMaster, rankingOrderMaster, type Database } from "../../db";

/**
 * ランキングCSVエクスポート用データ取得リポジトリ実装
 */
export class GetMyRankingExportRepository implements IGetMyRankingExportRepository {
  constructor(private readonly db: Database) { }

  /**
   * ランキングマスタ取得（所有権フィルタ済み）
   */
  async findRankings(userId: UserId, rankingIds: RankingId[]): Promise<MyRankingExportType[]> {
    return await this.db
      .select({
        id: rankingMaster.id,
        title: rankingMaster.title,
      })
      .from(rankingMaster)
      .where(and(
        eq(rankingMaster.deleteFlg, false),
        eq(rankingMaster.userId, userId.value),
        inArray(rankingMaster.id, rankingIds.map((rankingId) => rankingId.value)),
      ));
  }

  /**
   * ランキングオーダー取得（所有権フィルタ済みのランキングID一覧を渡すこと）
   */
  async findRankingOrders(rankingIds: RankingId[]): Promise<MyRankingExportOrderType[]> {
    return await this.db
      .select({
        rankingId: rankingOrderMaster.rankingId,
        itemName: rankingOrderMaster.itemName,
        itemMemo: rankingOrderMaster.itemMemo,
        order: rankingOrderMaster.order,
      })
      .from(rankingOrderMaster)
      .where(and(
        eq(rankingOrderMaster.deleteFlg, false),
        inArray(rankingOrderMaster.rankingId, rankingIds.map((rankingId) => rankingId.value)),
      ))
      .orderBy(rankingOrderMaster.rankingId, rankingOrderMaster.order);
  }
}
