const VALUES = [
    "updatedAtDesc",
    "updatedAtAsc",
    "createdAtDesc",
    "createdAtAsc",
    "itemCountDesc",
    "itemCountAsc",
] as const;

export type TrashRankingSortType = (typeof VALUES)[number];

/**
 * ゴミ箱のランキング一覧の並び順（updatedAt は削除日時に転用した値を表す）
 */
export class TrashRankingSort {

    static readonly VALUES = VALUES;
    static readonly DEFAULT: TrashRankingSortType = "updatedAtDesc";

    private readonly _value: TrashRankingSortType;

    constructor(sort: string) {

        const value = TrashRankingSort.VALUES.find((e) => e === sort);
        if (value === undefined) {
            throw new Error(`ゴミ箱の並び順が不正です。value:${sort}`);
        }

        this._value = value;
    }

    get value() {
        return this._value;
    }
}
