import { UserId } from "../../shared";
import { TagAggregate } from "../aggregate";
import { ITagResolutionRepository } from "../repository";
import { TagId, TagName } from "../value-object";

type PropsType = {
    userId: UserId;
    tagNames: TagName[];
}

/**
 * タグ名の解決結果
 */
type ResolvedTags = {
    /** 指定されたタグ名と同じ並びのタグ一覧 */
    tags: TagAggregate[];
    /** tags のうち新規作成したタグ（重複なし） */
    newTags: TagAggregate[];
}

/**
 * タグ名解決ドメインサービス
 */
export class TagResolutionDomainService {

    constructor(private readonly repository: ITagResolutionRepository) { }

    /**
     * タグ名を既存タグまたは新規タグに解決する。
     * 同一ユーザーの既存タグと同名であれば既存タグを再構築し、なければ新規作成する。
     * 同じタグ名が複数指定された場合は同じタグに解決する。
     * @param userId タグの所有ユーザー
     * @param tagNames 解決するタグ名一覧
     * @returns 解決したタグ一覧と、そのうちの新規タグ一覧
     */
    async resolve({ userId, tagNames }: PropsType): Promise<ResolvedTags> {
        if (tagNames.length === 0) {
            return { tags: [], newTags: [] };
        }

        const existingTags = await this.repository.findTags(userId, tagNames);
        const tagByName = new Map<string, TagAggregate>(
            existingTags.map((e) => [e.name, TagAggregate.reconstruct({
                tagId: TagId.of(e.id),
                userId,
                tagName: new TagName(e.name),
            })])
        );
        const newTags: TagAggregate[] = [];

        const tags = tagNames.map((tagName) => {
            const found = tagByName.get(tagName.value);
            if (found) {
                return found;
            }

            const created = TagAggregate.create({ userId, tagName });
            tagByName.set(tagName.value, created);
            newTags.push(created);
            return created;
        });

        return { tags, newTags };
    }
}
