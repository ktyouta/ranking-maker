import { and, count, eq } from "drizzle-orm";
import { IGetTrashListMyRankingRepository, TrashMyRankingListType } from "../../../domain";
import { UserId } from "../../../domain/user";
import type { Database } from "../../db";
import { publicStatusMaster, rankingMaster, rankingOrderMaster, userMaster } from "../../db";

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
        publicStatusName: publicStatusMaster.name,
        // ランキング削除時、紐づく項目も deleteFlg=true にカスケードされるため、生存行と逆に deleteFlg=true の項目を数える
        itemCount: count(rankingOrderMaster.id),
      })
      .from(rankingMaster)
      .innerJoin(userMaster, eq(userMaster.id, rankingMaster.userId))
      .innerJoin(publicStatusMaster, eq(publicStatusMaster.id, rankingMaster.publicStatus))
      .leftJoin(rankingOrderMaster, and(eq(rankingOrderMaster.rankingId, rankingMaster.id), eq(rankingOrderMaster.deleteFlg, true)))
      .where(and(eq(rankingMaster.deleteFlg, true), eq(rankingMaster.userId, userId.value)))
      .groupBy(rankingMaster.id, userMaster.name, publicStatusMaster.name);
  }
}
