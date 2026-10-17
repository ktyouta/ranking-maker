import { UserId } from "../../../shared";
import { type TagMasterRecord } from "../get-tags/get-tags.repository.interface";

/**
 * ゴミ箱一覧の絞り込み候補タグ取得リポジトリインターフェース
 */
export interface IGetTrashFilterTagsRepository {
    /**
     * ゴミ箱のランキングに付いているタグ一覧を取得する
     * @param userId タグを所有するユーザーID
     * @returns タグ名昇順のタグ一覧
     */
    findTags(userId: UserId): Promise<TagMasterRecord[]>;
}
