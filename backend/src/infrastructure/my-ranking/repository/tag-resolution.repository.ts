import { and, eq, inArray } from "drizzle-orm";
import { ITagResolutionRepository, TagName } from "../../../domain";
import { UserId } from "../../../domain/shared";
import { tagMaster, type Database } from "../../db";

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
  async findTags(userId: UserId, tagNames: TagName[]): Promise<{ id: string, name: string }[]> {
    const result = await this.db
      .select({
        id: tagMaster.id,
        name: tagMaster.name,
      })
      .from(tagMaster)
      .where(and(
        eq(tagMaster.deleteFlg, false),
        eq(tagMaster.userId, userId.value),
        inArray(tagMaster.name, tagNames.map((tagName) => tagName.value)),
      ));

    return result;
  }
}
