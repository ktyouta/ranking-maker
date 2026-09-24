import { ulid } from "ulid";

/**
 * タグID（ULID）
 */
export class TagId {
    private readonly _value: string;

    private constructor(tagId: string) {
        if (!tagId) {
            throw new Error("タグIDが設定されていません。");
        }
        this._value = tagId;
    }

    get value(): string {
        return this._value;
    }

    /**
     * ULIDでタグIDを生成
     */
    static generate(): TagId {
        return new TagId(ulid());
    }

    /**
     * 既存のタグIDからインスタンスを生成
     * @param tagId タグID
     */
    static of(tagId: string): TagId {
        return new TagId(tagId);
    }
}
