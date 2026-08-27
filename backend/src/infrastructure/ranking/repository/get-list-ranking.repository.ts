import { and, count, eq } from "drizzle-orm";
import { PublicStatus } from "../../../domain";
import type { IGetListRankingRepository, RankingListType } from "../../../domain/ranking";
import type { Database } from "../../db";
import { rankingMaster, rankingOrderMaster, userMaster } from "../../db";

/**
 * ランキング一覧取得リポジトリ実装
 */
export class GetListRankingRepository implements IGetListRankingRepository {
  constructor(private readonly db: Database) { }

  /**
   * 全件取得（論理削除されていないもの）
   */
  async findAll(): Promise<RankingListType[]> {
    return await this.db
      .select({
        id: rankingMaster.id,
        title: rankingMaster.title,
        publicStatus: rankingMaster.publicStatus,
        userName: userMaster.name,
        createdAt: rankingMaster.createdAt,
        itemCount: count(rankingOrderMaster.id),
      })
      .from(rankingMaster)
      .innerJoin(userMaster, eq(userMaster.id, rankingMaster.userId))
      .leftJoin(rankingOrderMaster, and(eq(rankingOrderMaster.rankingId, rankingMaster.id), eq(rankingOrderMaster.deleteFlg, false)))
      .where(and(eq(rankingMaster.deleteFlg, false), eq(rankingMaster.publicStatus, PublicStatus.PUBLIC)))
      .groupBy(rankingMaster.id, userMaster.name);
  }
}
