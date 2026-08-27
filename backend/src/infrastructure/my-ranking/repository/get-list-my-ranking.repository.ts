import { and, count, eq } from "drizzle-orm";
import { IGetListMyRankingRepository, MyRankingListType } from "../../../domain";
import { UserId } from "../../../domain/user";
import type { Database } from "../../db";
import { publicStatusMaster, rankingMaster, rankingOrderMaster, userMaster } from "../../db";

/**
 * ランキング一覧取得リポジトリ実装
 */
export class GetListMyRankingRepository implements IGetListMyRankingRepository {
  constructor(private readonly db: Database) { }

  /**
   * 全件取得（論理削除されていないもの）
   */
  async findAll(userId: UserId): Promise<MyRankingListType[]> {
    return await this.db
      .select({
        id: rankingMaster.id,
        title: rankingMaster.title,
        userName: userMaster.name,
        createdAt: rankingMaster.createdAt,
        publicStatus: rankingMaster.publicStatus,
        publicStatusName: publicStatusMaster.name,
        itemCount: count(rankingOrderMaster.id),
      })
      .from(rankingMaster)
      .innerJoin(userMaster, eq(userMaster.id, rankingMaster.userId))
      .innerJoin(publicStatusMaster, eq(publicStatusMaster.id, rankingMaster.publicStatus))
      .leftJoin(rankingOrderMaster, and(eq(rankingOrderMaster.rankingId, rankingMaster.id), eq(rankingOrderMaster.deleteFlg, false)))
      .where(and(eq(rankingMaster.deleteFlg, false), eq(rankingMaster.userId, userId.value)))
      .groupBy(rankingMaster.id, userMaster.name, publicStatusMaster.name);
  }
}
