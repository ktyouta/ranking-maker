import { UserId } from "../../shared";

export type TagMasterRecord = {
    name: string;
};

/**
 * タグ一覧取得リポジトリインターフェース
 */
export interface IGetTagsRepository {
    /**
     * ユーザーが所有するタグ一覧を取得する（deleteFlg=false のみ）
     * @param userId タグを所有するユーザーID
     * @returns タグ名昇順のタグ一覧
     */
    findTags(userId: UserId): Promise<TagMasterRecord[]>;
}
