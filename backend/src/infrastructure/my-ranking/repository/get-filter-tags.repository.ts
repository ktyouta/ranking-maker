import { and, eq, exists } from "drizzle-orm";
import { IGetFilterTagsRepository, TagMasterRecord } from "../../../domain";
import { UserId } from "../../../domain/shared";
import { rankingTagMaster, tagMaster, type Database } from "../../db";

/**
 * ランキング一覧の絞り込み候補タグ取得リポジトリ実装
 */
export class GetFilterTagsRepository implements IGetFilterTagsRepository {
  constructor(private readonly db: Database) { }

  /**
   * ゴミ箱に入っていないランキングに付いているタグ一覧を取得する
   * @param userId タグを所有するユーザーID
   * @returns タグ名昇順のタグ一覧
   */
  async findTags(userId: UserId): Promise<TagMasterRecord[]> {
    return await this.db
      .select({
        name: tagMaster.name,
      })
      .from(tagMaster)
      .where(and(
        eq(tagMaster.deleteFlg, false),
        eq(tagMaster.userId, userId.value),
        exists(
          this.db
            .select({ id: rankingTagMaster.id })
            .from(rankingTagMaster)
            .where(and(
              eq(rankingTagMaster.tagId, tagMaster.id),
              eq(rankingTagMaster.deleteFlg, false),
            )),
        ),
      ))
      .orderBy(tagMaster.name);
  }
}
