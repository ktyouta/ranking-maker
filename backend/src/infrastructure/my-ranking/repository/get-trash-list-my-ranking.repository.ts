import { and, asc, count, desc, eq, exists, gte, like, lte, or, type SQL } from "drizzle-orm";
import { IGetTrashListMyRankingRepository, TrashMyRankingListType, TrashMyRankingQueryType, TrashRankingSort, TrashRankingSortType } from "../../../domain";
import { UserId } from "../../../domain/shared";
import type { Database } from "../../db";
import { publicStatusMaster, rankingMaster, rankingOrderMaster, userMaster } from "../../db";

/**
 * ゴミ箱のランキング一覧取得リポジトリ実装
 */
export class GetTrashListMyRankingRepository implements IGetTrashListMyRankingRepository {

  // 1ページあたりの最大取得件数
  static readonly LIMIT = 30;

  constructor(private readonly db: Database) { }

  /**
   * 削除済み一覧取得（論理削除されているもの、ページング・絞り込み対応）
   */
  async findAll(userId: UserId, query: TrashMyRankingQueryType): Promise<TrashMyRankingListType[]> {

    const conditions = this.buildConditions(userId, query);

    return await this.db
      .select({
        id: rankingMaster.id,
        title: rankingMaster.title,
        userName: userMaster.name,
        createdAt: rankingMaster.createdAt,
        // 論理削除時に更新される updatedAt を削除日時として転用する
        updatedAt: rankingMaster.updatedAt,
        publicStatus: rankingMaster.publicStatus,
        publicStatusName: publicStatusMaster.name,
        icon: rankingMaster.icon,
        // ランキング削除時、紐づく項目も deleteFlg=true にカスケードされるため、生存行と逆に deleteFlg=true の項目を数える
        itemCount: count(rankingOrderMaster.id),
      })
      .from(rankingMaster)
      .innerJoin(userMaster, eq(userMaster.id, rankingMaster.userId))
      .innerJoin(publicStatusMaster, eq(publicStatusMaster.id, rankingMaster.publicStatus))
      .leftJoin(rankingOrderMaster, and(eq(rankingOrderMaster.rankingId, rankingMaster.id), eq(rankingOrderMaster.deleteFlg, true)))
      .where(and(...conditions))
      .groupBy(rankingMaster.id, userMaster.name, publicStatusMaster.name)
      .orderBy(...this.buildOrderBy(query.sort))
      .limit(GetTrashListMyRankingRepository.LIMIT)
      .offset((query.page - 1) * GetTrashListMyRankingRepository.LIMIT);
  }

  /**
   * 削除済み件数取得
   */
  async count(userId: UserId, query: TrashMyRankingQueryType): Promise<number> {

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
  private buildOrderBy(sort: TrashRankingSort): SQL[] {
    const orderBy: Record<TrashRankingSortType, SQL[]> = {
      updatedAtDesc: [desc(rankingMaster.updatedAt), desc(rankingMaster.id)],
      updatedAtAsc: [asc(rankingMaster.updatedAt), asc(rankingMaster.id)],
      createdAtDesc: [desc(rankingMaster.createdAt), desc(rankingMaster.id)],
      createdAtAsc: [asc(rankingMaster.createdAt), asc(rankingMaster.id)],
      itemCountDesc: [desc(count(rankingOrderMaster.id)), desc(rankingMaster.updatedAt), desc(rankingMaster.id)],
      itemCountAsc: [asc(count(rankingOrderMaster.id)), desc(rankingMaster.updatedAt), desc(rankingMaster.id)],
    };
    return orderBy[sort.value];
  }

  private buildConditions(userId: UserId, query: TrashMyRankingQueryType) {
    return [
      eq(rankingMaster.deleteFlg, true),
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
                  // ゴミ箱側は論理削除カスケードにより項目も deleteFlg=true になっているため、生存行(false)と逆の条件になる
                  eq(rankingOrderMaster.deleteFlg, true),
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
    ];
  }
}
