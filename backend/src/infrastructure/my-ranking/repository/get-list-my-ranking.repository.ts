import { and, asc, count, desc, eq, exists, gte, like, lte, or, type SQL, type SQLWrapper } from "drizzle-orm";
import { IGetListMyRankingRepository, MyRankingListType, MyRankingQueryType, RankingSort, RankingSortType } from "../../../domain";
import { UserId } from "../../../domain/shared";
import type { Database } from "../../db";
import { publicStatusMaster, rankingMaster, rankingOrderMaster, rankingTagMaster, tagMaster, userMaster } from "../../db";

/**
 * ランキング一覧取得リポジトリ実装
 */
export class GetListMyRankingRepository implements IGetListMyRankingRepository {

  constructor(private readonly db: Database) { }

  /**
   * 一覧取得（論理削除されていないもの、ページング・絞り込み対応）
   */
  async findAll(userId: UserId, query: MyRankingQueryType, pageSize: number): Promise<MyRankingListType[]> {

    const conditions = this.buildConditions(userId, query);

    // 表示するページのランキングIDを先に確定し、項目の結合・集計をそのページ分に限定する
    const page = this.db.$with("page").as(
      this.db
        .select({ id: rankingMaster.id })
        .from(rankingMaster)
        .where(and(...conditions))
        .orderBy(...this.buildOrderBy(query.sort, this.countItems()))
        .limit(pageSize)
        .offset((query.page - 1) * pageSize)
    );

    return await this.db
      .with(page)
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
      .from(page)
      .innerJoin(rankingMaster, eq(rankingMaster.id, page.id))
      .innerJoin(userMaster, eq(userMaster.id, rankingMaster.userId))
      .innerJoin(publicStatusMaster, eq(publicStatusMaster.id, rankingMaster.publicStatus))
      .leftJoin(rankingOrderMaster, and(eq(rankingOrderMaster.rankingId, rankingMaster.id), eq(rankingOrderMaster.deleteFlg, false)))
      .groupBy(rankingMaster.id, userMaster.name, publicStatusMaster.name)
      .orderBy(...this.buildOrderBy(query.sort, count(rankingOrderMaster.id)));
  }

  /**
   * 件数取得
   */
  async count(userId: UserId, query: Omit<MyRankingQueryType, "page">): Promise<number> {

    const conditions = this.buildConditions(userId, query);

    const [{ total }] = await this.db
      .select({ total: count(rankingMaster.id) })
      .from(rankingMaster)
      .where(and(...conditions));

    return total;
  }

  /**
   * 並び順をDrizzleの式に変換（同値の行のページ境界が安定するよう、最後に必ず id を含める）
   * @param sort 並び順
   * @param itemCount 項目数順の並び替えに使う項目数の式
   * @returns ORDER BY に渡す式の一覧
   */
  private buildOrderBy(sort: RankingSort, itemCount: SQLWrapper): SQL[] {
    const orderBy: Record<RankingSortType, SQL[]> = {
      updatedAtDesc: [desc(rankingMaster.updatedAt), desc(rankingMaster.id)],
      updatedAtAsc: [asc(rankingMaster.updatedAt), asc(rankingMaster.id)],
      createdAtDesc: [desc(rankingMaster.createdAt), desc(rankingMaster.id)],
      createdAtAsc: [asc(rankingMaster.createdAt), asc(rankingMaster.id)],
      itemCountDesc: [desc(itemCount), desc(rankingMaster.updatedAt), desc(rankingMaster.id)],
      itemCountAsc: [asc(itemCount), desc(rankingMaster.updatedAt), desc(rankingMaster.id)],
      favoriteDesc: [desc(rankingMaster.isFavorite), desc(rankingMaster.updatedAt), desc(rankingMaster.id)],
    };
    return orderBy[sort.value];
  }

  /**
   * ランキングごとの項目数を数える相関サブクエリ
   * @returns 外側の ranking_master の行ごとに項目数を返すサブクエリ
   */
  private countItems() {
    return this.db
      .select({ itemCount: count() })
      .from(rankingOrderMaster)
      .where(and(eq(rankingOrderMaster.rankingId, rankingMaster.id), eq(rankingOrderMaster.deleteFlg, false)));
  }

  private buildConditions(userId: UserId, query: Omit<MyRankingQueryType, "page">) {
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
      // 指定したタグがすべて付いているランキングに絞り込むため、タグごとに EXISTS を AND でつなぐ
      ...(query.tagNames ?? []).map((tagName) =>
        exists(
          this.db
            .select({ id: rankingTagMaster.id })
            .from(rankingTagMaster)
            .innerJoin(tagMaster, eq(tagMaster.id, rankingTagMaster.tagId))
            .where(and(
              eq(rankingTagMaster.rankingId, rankingMaster.id),
              eq(rankingTagMaster.deleteFlg, false),
              eq(tagMaster.deleteFlg, false),
              eq(tagMaster.name, tagName.value),
              eq(tagMaster.userId, userId.value),
            )),
        )
      ),
    ];
  }
}
