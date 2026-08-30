import { and, count, desc, eq, gte, like, lte } from "drizzle-orm";
import { IGetTrashListMyRankingRepository, TrashMyRankingListType, TrashMyRankingQueryType } from "../../../domain";
import { UserId } from "../../../domain/user";
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
        // ランキング削除時、紐づく項目も deleteFlg=true にカスケードされるため、生存行と逆に deleteFlg=true の項目を数える
        itemCount: count(rankingOrderMaster.id),
      })
      .from(rankingMaster)
      .innerJoin(userMaster, eq(userMaster.id, rankingMaster.userId))
      .innerJoin(publicStatusMaster, eq(publicStatusMaster.id, rankingMaster.publicStatus))
      .leftJoin(rankingOrderMaster, and(eq(rankingOrderMaster.rankingId, rankingMaster.id), eq(rankingOrderMaster.deleteFlg, true)))
      .where(and(...conditions))
      .groupBy(rankingMaster.id, userMaster.name, publicStatusMaster.name)
      .orderBy(desc(rankingMaster.updatedAt))
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

  private buildConditions(userId: UserId, query: TrashMyRankingQueryType) {
    return [
      eq(rankingMaster.deleteFlg, true),
      eq(rankingMaster.userId, userId.value),
      ...(query.title ? [like(rankingMaster.title, `%${query.title}%`)] : []),
      ...(query.createdAtFrom ? [gte(rankingMaster.createdAt, query.createdAtFrom)] : []),
      ...(query.createdAtTo ? [lte(rankingMaster.createdAt, query.createdAtTo)] : []),
      ...(query.updatedAtFrom ? [gte(rankingMaster.updatedAt, query.updatedAtFrom)] : []),
      ...(query.updatedAtTo ? [lte(rankingMaster.updatedAt, query.updatedAtTo)] : []),
    ];
  }
}
