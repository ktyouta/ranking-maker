import { and, eq } from "drizzle-orm";
import type { IGetRankingRepository, RankingId, RankingOrderType, RankingType } from "../../../domain";
import { PublicStatus } from "../../../domain";
import type { Database } from "../../db";
import { rankingMaster, rankingOrderMaster, userMaster } from "../../db";

/**
 * ランキング取得リポジトリ実装
 */
export class GetRankingRepository implements IGetRankingRepository {
  constructor(private readonly db: Database) { }

  /**
   * 公開かつ未削除の指定IDランキングを1件取得する
   * @param rankingId ランキングID
   * @returns 該当ランキング。存在しない場合は null
   */
  async findRanking(rankingId: RankingId): Promise<RankingType | null> {
    const result = await this.db
      .select({
        id: rankingMaster.id,
        title: rankingMaster.title,
        userName: userMaster.name,
        createdAt: rankingMaster.createdAt,
      })
      .from(rankingMaster)
      .innerJoin(userMaster, eq(userMaster.id, rankingMaster.userId))
      .leftJoin(rankingOrderMaster, and(eq(rankingOrderMaster.rankingId, rankingMaster.id), eq(rankingOrderMaster.deleteFlg, false)))
      .where(and(eq(rankingMaster.deleteFlg, false), eq(rankingMaster.publicStatus, PublicStatus.PUBLIC), eq(rankingMaster.id, rankingId.value)))

    if (result.length === 0) {
      return null;
    }

    return result[0];
  }

  /**
   * ランキングオーダー取得
   * @param rankingId 
   */
  async findRankingOrder(rankingId: RankingId): Promise<RankingOrderType[]> {
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
