const VALUES = [
    "updatedAtDesc",
    "updatedAtAsc",
    "createdAtDesc",
    "createdAtAsc",
    "itemCountDesc",
    "itemCountAsc",
    "favoriteDesc",
] as const;

export type RankingSortType = (typeof VALUES)[number];

/**
 * マイランキング一覧の並び順
 */
export class RankingSort {

    static readonly VALUES = VALUES;
    static readonly DEFAULT: RankingSortType = "updatedAtDesc";

    private readonly _value: RankingSortType;

    constructor(sort: string) {

        const value = RankingSort.VALUES.find((e) => e === sort);
        if (value === undefined) {
            throw new Error(`マイランキングの並び順が不正です。value:${sort}`);
        }

        this._value = value;
    }

    get value() {
        return this._value;
    }
}
