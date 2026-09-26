import { UserId } from "../../shared";
import { TagAggregate } from "../aggregate";
import { TagName } from "../value-object";

/**
 * タグ名解決リポジトリインターフェース
 */
export interface ITagResolutionRepository {
    /**
     * 指定したタグ名に一致するタグを一括取得する（同一ユーザー内・未削除のもの）
     * @param userId タグの所有ユーザー
     * @param tagNames 取得するタグ名一覧
     * @returns 一致したタグ一覧
     */
    findTags(userId: UserId, tagNames: TagName[]): Promise<TagAggregate[]>;
}
