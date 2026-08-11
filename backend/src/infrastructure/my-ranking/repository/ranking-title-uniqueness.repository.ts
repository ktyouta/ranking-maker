import { and, eq } from "drizzle-orm";
import { IRankingTitleUniquenessRepository, RankingTitle } from "../../../domain";
import { UserId } from "../../../domain/user";
import { rankingMaster, type Database } from "../../db";

/**
 * ランキングタイトル一意性判定リポジトリ実装
 */
export class RankingTitleUniquenessRepository implements IRankingTitleUniquenessRepository {
  constructor(private readonly db: Database) { }

  /**
   * 同名ランキングの取得（同一ユーザー内・未削除のもの）
   */
  async findRanking(userId: UserId, rankingTitle: RankingTitle): Promise<{ id: string }[]> {
    const result = await this.db
      .select({
        id: rankingMaster.id,
      })
      .from(rankingMaster)
      .where(and(eq(rankingMaster.deleteFlg, false), eq(rankingMaster.userId, userId.value), eq(rankingMaster.title, rankingTitle.value)));

    return result;
  }
}
