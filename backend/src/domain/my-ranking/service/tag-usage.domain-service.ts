import { RankingId, UserId } from "../../shared";
import { ITagUsageRepository } from "../repository";
import { TagId } from "../value-object";

type PropsType = {
    userId: UserId;
    rankingId: RankingId;
    releasedTagIds: TagId[];
}

/**
 * タグ使用状況ドメインサービス
 */
export class TagUsageDomainService {

    constructor(private readonly repository: ITagUsageRepository) { }

    /**
     * ランキングから手放したタグのうち、どのランキングにも紐づかなくなるタグを求める。
     * ゴミ箱内のランキングに紐づいているタグは、復元に備えて使用中とみなす。
     * @param userId タグの所有ユーザー
     * @param rankingId タグを手放したランキングID
     * @param releasedTagIds ランキングから手放したタグID一覧
     * @returns 未使用になるタグID一覧
     */
    async findUnused({ userId, rankingId, releasedTagIds }: PropsType): Promise<TagId[]> {
        if (releasedTagIds.length === 0) {
            return [];
        }

        const referenced = await this.repository.findReferencedTagIds(userId, rankingId, releasedTagIds);
        const referencedTagIds = new Set(referenced.map((e) => e.tagId));

        return releasedTagIds.filter((e) => !referencedTagIds.has(e.value));
    }
}
