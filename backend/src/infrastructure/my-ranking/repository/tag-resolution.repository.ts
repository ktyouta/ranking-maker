import { and, eq, inArray } from "drizzle-orm";
import { ITagResolutionRepository, TagAggregate, TagId, TagName } from "../../../domain";
import { UserId } from "../../../domain/shared";
import { chunk } from "../../../util";
import { D1_MAX_IN_CLAUSE_VALUES, tagMaster, type Database } from "../../db";

/**
 * タグ名解決リポジトリ実装
 */
export class TagResolutionRepository implements ITagResolutionRepository {
  constructor(private readonly db: Database) { }

  /**
   * 指定したタグ名に一致するタグを一括取得する（同一ユーザー内・未削除のもの）
   * @param userId タグの所有ユーザー
   * @param tagNames 取得するタグ名一覧
   * @returns 一致したタグ一覧
   */
  async findTags(userId: UserId, tagNames: TagName[]): Promise<TagAggregate[]> {
    const results = await Promise.all(
      chunk(tagNames.map((tagName) => tagName.value), D1_MAX_IN_CLAUSE_VALUES).map((names) =>
        this.db
          .select({
            id: tagMaster.id,
            userId: tagMaster.userId,
            name: tagMaster.name,
          })
          .from(tagMaster)
          .where(and(
            eq(tagMaster.deleteFlg, false),
            eq(tagMaster.userId, userId.value),
            inArray(tagMaster.name, names),
          ))
      )
    );

    return results.flat().map((e) =>
      TagAggregate.reconstruct({
        tagId: TagId.of(e.id),
        userId: UserId.of(e.userId),
        tagName: new TagName(e.name),
      })
    );
  }
}
