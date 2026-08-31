import { and, count, desc, eq, gte, like, lte } from "drizzle-orm";
import { IGetListMyRankingRepository, MyRankingListType, MyRankingQueryType } from "../../../domain";
import { UserId } from "../../../domain/user";
import type { Database } from "../../db";
import { publicStatusMaster, rankingMaster, rankingOrderMaster, userMaster } from "../../db";

/**
 * ランキング一覧取得リポジトリ実装
 */
export class GetListMyRankingRepository implements IGetListMyRankingRepository {

  // 1ページあたりの最大取得件数
  static readonly LIMIT = 30;

  constructor(private readonly db: Database) { }

  /**
   * 一覧取得（論理削除されていないもの、ページング・絞り込み対応）
   */
  async findAll(userId: UserId, query: MyRankingQueryType): Promise<MyRankingListType[]> {

    const conditions = this.buildConditions(userId, query);

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
      .where(and(...conditions))
      .groupBy(rankingMaster.id, userMaster.name, publicStatusMaster.name)
      .orderBy(desc(rankingMaster.createdAt))
      .limit(GetListMyRankingRepository.LIMIT)
      .offset((query.page - 1) * GetListMyRankingRepository.LIMIT);
  }

  /**
   * 件数取得
   */
  async count(userId: UserId, query: MyRankingQueryType): Promise<number> {

    const conditions = this.buildConditions(userId, query);

    const [{ total }] = await this.db
      .select({ total: count(rankingMaster.id) })
      .from(rankingMaster)
      .where(and(...conditions));

    return total;
  }

  private buildConditions(userId: UserId, query: MyRankingQueryType) {
    return [
      eq(rankingMaster.deleteFlg, false),
      eq(rankingMaster.userId, userId.value),
      ...(query.title ? [like(rankingMaster.title, `%${query.title}%`)] : []),
      ...(query.createdAtFrom ? [gte(rankingMaster.createdAt, query.createdAtFrom)] : []),
      ...(query.createdAtTo ? [lte(rankingMaster.createdAt, query.createdAtTo)] : []),
      ...(query.updatedAtFrom ? [gte(rankingMaster.updatedAt, query.updatedAtFrom)] : []),
      ...(query.updatedAtTo ? [lte(rankingMaster.updatedAt, query.updatedAtTo)] : []),
    ];
  }
}
