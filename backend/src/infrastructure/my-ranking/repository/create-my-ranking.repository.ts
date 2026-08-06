import { and, eq } from "drizzle-orm";
import { RankingType } from "../../../domain/my-ranking/repository";
import { ICreateMyRankingRepository } from "../../../domain/my-ranking/repository/create-my-ranking.repository.interface";
import { RankingAggregate } from "../../../domain/shared/aggregate/ranking-aggregate";
import { RankingId } from "../../../domain/shared/value-object/ranking-id";
import { UserId } from "../../../domain/user";
import { publicStatusMaster, rankingMaster, type Database } from "../../db";

/**
 * ランキング作成リポジトリ実装
 */
export class CreateMyRankingRepository implements ICreateMyRankingRepository {
  constructor(private readonly db: Database) { }

  /**
   * ランキングマスタ取得
   */
  async findRanking(userId: UserId, rankingId: RankingId): Promise<RankingType | null> {
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
   * ランキング作成
   * @param db 
   * @param rankingAggregate 
   */
  async createRanking(rankingAggregate: RankingAggregate) {
    const now = new Date().toISOString();

    // await this.db.batch([
    //   db.insert(rankingMaster).values({
    //     id: rankingAggregate.rankingId,
    //     deleteFlg: false,
    //     createdAt: now,
    //     updatedAt: now,
    //   }),

    // ]);
  }
}
