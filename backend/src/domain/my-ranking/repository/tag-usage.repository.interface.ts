import { RankingId, UserId } from "../../shared";
import { TagId } from "../value-object";

/**
 * タグ使用状況リポジトリインターフェース
 */
export interface ITagUsageRepository {
    /**
     * 指定したタグのうち、指定ランキング以外のランキングに紐づいているタグを取得する
     * （論理削除された紐づけも含む）
     * @param userId タグの所有ユーザー
     * @param rankingId 判定から除外するランキングID
     * @param tagIds 判定対象のタグID一覧
     * @returns 他のランキングに紐づいているタグID一覧
     */
    findReferencedTagIds(userId: UserId, rankingId: RankingId, tagIds: TagId[]): Promise<{ tagId: string }[]>;
}
