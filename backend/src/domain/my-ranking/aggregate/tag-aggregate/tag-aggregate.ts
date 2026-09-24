import { RankingId } from "../../../shared";
import { TagEntity } from "../../entity";

/**
 * タグ集約の生成・再構築に渡すパラメータ
 */
type TagAggregateParams = {
    rankingId: RankingId;
    tagList: TagEntity[];
};

type TagSnapshot = {
    rankingId: string;
    tagList: {
        id: string;
        name: string;
    }[];
};

export class TagAggregate {

    constructor(private readonly _rankingId: RankingId,
        private readonly _tagList: TagEntity[],
    ) { }

    static create(params: TagAggregateParams) {

    }

    static reconstruct(params: TagAggregateParams) {
        return new TagAggregate(
            params.rankingId,
            params.tagList,
        );
    }

    private static collectItemViolations() {
    }

    /**
     * スナップショット作成
     * @returns 
     */
    toSnapshot(): TagSnapshot {
        return {
            rankingId: this._rankingId.value,
            tagList: this._tagList.map((tag) => {
                return {
                    id: tag.tagId,
                    name: tag.name,
                }
            })
        }
    }
}