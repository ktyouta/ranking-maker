import { and, eq } from "drizzle-orm";
import { IGetListMyRankingRepository, RankingListType } from "../../../domain/my-ranking/repository";
import { UserId } from "../../../domain/user";
import type { Database } from "../../db";
import { publicStatusMaster, rankingMaster, userMaster } from "../../db";

/**
 * ランキング一覧取得リポジトリ実装
 */
export class GetListMyRankingRepository implements IGetListMyRankingRepository {
  constructor(private readonly db: Database) { }

  /**
   * 全件取得（論理削除されていないもの）
   */
  async findAll(userId: UserId): Promise<RankingListType[]> {
    return await this.db
      .select({
        id: rankingMaster.id,
        title: rankingMaster.title,
        userName: userMaster.name,
        createdAt: rankingMaster.createdAt,
        publicStatus: rankingMaster.publicStatus,
        publicStatusName: publicStatusMaster.name
      })
      .from(rankingMaster)
      .innerJoin(userMaster, eq(userMaster.id, rankingMaster.userId))
      .innerJoin(publicStatusMaster, eq(publicStatusMaster.id, rankingMaster.publicStatus))
      .where(and(eq(rankingMaster.deleteFlg, false), eq(rankingMaster.userId, userId.value)));
  }
}
