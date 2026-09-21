import { and, asc, count, desc, eq, exists, gte, like, lte, or, type SQL } from "drizzle-orm";
import { IGetListMyRankingRepository, MyRankingListType, MyRankingQueryType, RankingSort, RankingSortType } from "../../../domain";
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
        updatedAt: rankingMaster.updatedAt,
        publicStatus: rankingMaster.publicStatus,
        publicStatusName: publicStatusMaster.name,
        icon: rankingMaster.icon,
        itemCount: count(rankingOrderMaster.id),
        isFavorite: rankingMaster.isFavorite,
      })
      .from(rankingMaster)
      .innerJoin(userMaster, eq(userMaster.id, rankingMaster.userId))
      .innerJoin(publicStatusMaster, eq(publicStatusMaster.id, rankingMaster.publicStatus))
      .leftJoin(rankingOrderMaster, and(eq(rankingOrderMaster.rankingId, rankingMaster.id), eq(rankingOrderMaster.deleteFlg, false)))
      .where(and(...conditions))
      .groupBy(rankingMaster.id, userMaster.name, publicStatusMaster.name)
      .orderBy(...this.buildOrderBy(query.sort))
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

  /**
   * 並び順をDrizzleの式に変換（同値の行のページ境界が安定するよう、最後に必ず id を含める）
   */
  private buildOrderBy(sort: RankingSort): SQL[] {
    const orderBy: Record<RankingSortType, SQL[]> = {
      updatedAtDesc: [desc(rankingMaster.updatedAt), desc(rankingMaster.id)],
      updatedAtAsc: [asc(rankingMaster.updatedAt), asc(rankingMaster.id)],
      createdAtDesc: [desc(rankingMaster.createdAt), desc(rankingMaster.id)],
      createdAtAsc: [asc(rankingMaster.createdAt), asc(rankingMaster.id)],
      itemCountDesc: [desc(count(rankingOrderMaster.id)), desc(rankingMaster.updatedAt), desc(rankingMaster.id)],
      itemCountAsc: [asc(count(rankingOrderMaster.id)), desc(rankingMaster.updatedAt), desc(rankingMaster.id)],
      favoriteDesc: [desc(rankingMaster.isFavorite), desc(rankingMaster.updatedAt), desc(rankingMaster.id)],
    };
    return orderBy[sort.value];
  }

  private buildConditions(userId: UserId, query: MyRankingQueryType) {
    return [
      eq(rankingMaster.deleteFlg, false),
      eq(rankingMaster.userId, userId.value),
      ...(query.keyword
        ? [
          or(
            like(rankingMaster.title, `%${query.keyword}%`),
            exists(
              this.db
                .select({ id: rankingOrderMaster.id })
                .from(rankingOrderMaster)
                .where(and(
                  eq(rankingOrderMaster.rankingId, rankingMaster.id),
                  eq(rankingOrderMaster.deleteFlg, false),
                  or(
                    like(rankingOrderMaster.itemName, `%${query.keyword}%`),
                    like(rankingOrderMaster.itemMemo, `%${query.keyword}%`),
                  ),
                )),
            ),
          ),
        ]
        : []),
      ...(query.createdAtFrom ? [gte(rankingMaster.createdAt, query.createdAtFrom)] : []),
      ...(query.createdAtTo ? [lte(rankingMaster.createdAt, query.createdAtTo)] : []),
      ...(query.updatedAtFrom ? [gte(rankingMaster.updatedAt, query.updatedAtFrom)] : []),
      ...(query.updatedAtTo ? [lte(rankingMaster.updatedAt, query.updatedAtTo)] : []),
      ...(query.favoriteOnly ? [eq(rankingMaster.isFavorite, true)] : []),
    ];
  }
}
