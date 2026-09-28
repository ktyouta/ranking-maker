import { UserId } from "../../shared";
import { TagMasterRecord } from "./get-tags.repository.interface";

/**
 * ランキング一覧の絞り込み候補タグ取得リポジトリインターフェース
 */
export interface IGetFilterTagsRepository {
    /**
     * ゴミ箱に入っていないランキングに付いているタグ一覧を取得する
     * @param userId タグを所有するユーザーID
     * @returns タグ名昇順のタグ一覧
     */
    findTags(userId: UserId): Promise<TagMasterRecord[]>;
}
