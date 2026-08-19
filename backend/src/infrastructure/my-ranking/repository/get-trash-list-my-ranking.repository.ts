import { and, eq } from "drizzle-orm";
import { IGetTrashListMyRankingRepository, TrashMyRankingListType } from "../../../domain";
import { UserId } from "../../../domain/user";
import type { Database } from "../../db";
import { publicStatusMaster, rankingMaster, userMaster } from "../../db";

/**
 * ゴミ箱のランキング一覧取得リポジトリ実装
 */
export class GetTrashListMyRankingRepository implements IGetTrashListMyRankingRepository {
  constructor(private readonly db: Database) { }

  /**
   * 全件取得（論理削除されているもの）
   */
  async findAll(userId: UserId): Promise<TrashMyRankingListType[]> {
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
      .where(and(eq(rankingMaster.deleteFlg, true), eq(rankingMaster.userId, userId.value)));
  }
}
