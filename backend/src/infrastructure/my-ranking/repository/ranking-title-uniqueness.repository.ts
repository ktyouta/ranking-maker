import { and, eq, ne } from "drizzle-orm";
import { IRankingTitleUniquenessRepository, RankingId, RankingTitle } from "../../../domain";
import { UserId } from "../../../domain/shared";
import { rankingMaster, type Database } from "../../db";

/**
 * ランキングタイトル一意性判定リポジトリ実装
 */
export class RankingTitleUniquenessRepository implements IRankingTitleUniquenessRepository {
  constructor(private readonly db: Database) { }

  /**
   * 同名ランキングの取得（同一ユーザー内・未削除のもの）
   * rankingId 自身は除外する（更新時の自己重複を防ぐ）。
   */
  async findRanking(userId: UserId, rankingTitle: RankingTitle, rankingId: RankingId): Promise<{ id: string }[]> {
    const result = await this.db
      .select({
        id: rankingMaster.id,
      })
      .from(rankingMaster)
      .where(and(
        eq(rankingMaster.deleteFlg, false),
        eq(rankingMaster.userId, userId.value),
        eq(rankingMaster.title, rankingTitle.value),
        ne(rankingMaster.id, rankingId.value),
      ));

    return result;
  }

  /**
   * 複数ランキング分の同名ランキングを一括取得する（同一ユーザー内・未削除のもの）。
   * rankingIds 自身は除外する（一括判定時の自己重複を防ぐ）。
   */
  async findRankings(userId: UserId, rankingIds: RankingId[]): Promise<{ id: string, title: string }[]> {
    const excludedIds = new Set(rankingIds.map((rankingId) => rankingId.value));
    const result = await this.db
      .select({
        id: rankingMaster.id,
        title: rankingMaster.title,
      })
      .from(rankingMaster)
      .where(and(
        eq(rankingMaster.deleteFlg, false),
        eq(rankingMaster.userId, userId.value),
      ));

    return result.filter((ranking) => !excludedIds.has(ranking.id));
  }
}
