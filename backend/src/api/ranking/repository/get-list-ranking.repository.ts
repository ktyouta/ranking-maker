import { and, eq } from "drizzle-orm";
import { Database, rankingMaster, userMaster } from "../../../infrastructure/db";
import type { IGetListRankingRepository, RankingListType } from "./get-list-ranking.repository.interface";

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
        userName: userMaster.name,
        createdAt: rankingMaster.createdAt,
      })
      .from(rankingMaster)
      .innerJoin(userMaster, eq(userMaster.id, rankingMaster.userId))
      .where(and(eq(rankingMaster.deleteFlg, false), eq(rankingMaster.publicStatus, 1)));
  }
}
