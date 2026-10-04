import { and, eq } from "drizzle-orm";
import { IGetTagsRepository, TagMasterRecord } from "../../../../domain";
import { UserId } from "../../../../domain/shared";
import { tagMaster, type Database } from "../../../db";

/**
 * タグ一覧取得リポジトリ実装
 */
export class GetTagsRepository implements IGetTagsRepository {
  constructor(private readonly db: Database) { }

  /**
   * ユーザーが所有するタグ一覧を取得する（deleteFlg=false のみ）
   * @param userId タグを所有するユーザーID
   * @returns タグ名昇順のタグ一覧
   */
  async findTags(userId: UserId): Promise<TagMasterRecord[]> {
    return await this.db
      .select({
        name: tagMaster.name,
      })
      .from(tagMaster)
      .where(and(eq(tagMaster.deleteFlg, false), eq(tagMaster.userId, userId.value)))
      .orderBy(tagMaster.name);
  }
}
