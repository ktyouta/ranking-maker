import { and, eq, inArray, ne } from "drizzle-orm";
import { ITagUsageRepository, TagId } from "../../../domain";
import { RankingId, UserId } from "../../../domain/shared";
import { chunk } from "../../../util";
import { D1_MAX_IN_CLAUSE_VALUES, rankingTagMaster, type Database } from "../../db";

/**
 * タグ使用状況リポジトリ実装
 */
export class TagUsageRepository implements ITagUsageRepository {
  constructor(private readonly db: Database) { }

  /**
   * 指定したタグのうち、指定ランキング以外のランキングに紐づいているタグを取得する
   * （論理削除された紐づけも含む）
   * @param userId タグの所有ユーザー
   * @param rankingId 判定から除外するランキングID
   * @param tagIds 判定対象のタグID一覧
   * @returns 他のランキングに紐づいているタグID一覧
   */
  async findReferencedTagIds(userId: UserId, rankingId: RankingId, tagIds: TagId[]): Promise<{ tagId: string }[]> {
    const results = await Promise.all(
      chunk(tagIds.map((e) => e.value), D1_MAX_IN_CLAUSE_VALUES).map((ids) =>
        this.db
          .selectDistinct({
            tagId: rankingTagMaster.tagId,
          })
          .from(rankingTagMaster)
          .where(and(
            eq(rankingTagMaster.userId, userId.value),
            ne(rankingTagMaster.rankingId, rankingId.value),
            inArray(rankingTagMaster.tagId, ids),
          ))
      )
    );

    return results.flat();
  }
}
