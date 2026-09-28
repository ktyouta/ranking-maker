import { and, eq, exists } from "drizzle-orm";
import { IGetTrashFilterTagsRepository, TagMasterRecord } from "../../../domain";
import { UserId } from "../../../domain/shared";
import { rankingTagMaster, tagMaster, type Database } from "../../db";

/**
 * ゴミ箱一覧の絞り込み候補タグ取得リポジトリ実装
 */
export class GetTrashFilterTagsRepository implements IGetTrashFilterTagsRepository {
  constructor(private readonly db: Database) { }

  /**
   * ゴミ箱のランキングに付いているタグ一覧を取得する
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
              // ゴミ箱側は論理削除カスケードによりタグ付けも deleteFlg=true になっているため、生存行(false)と逆の条件になる
              eq(rankingTagMaster.deleteFlg, true),
            )),
        ),
      ))
      .orderBy(tagMaster.name);
  }
}
