import { err, ok, type Result } from "neverthrow";

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
 * マイランキング一覧の並び順の生成失敗
 */
export type RankingSortError = { type: "RANKING_SORT_INVALID" };

/**
 * マイランキング一覧の並び順
 */
export class RankingSort {

    static readonly VALUES = VALUES;
    static readonly DEFAULT: RankingSortType = "updatedAtDesc";

    private readonly _value: RankingSortType;

    /**
     * @param sort 許容値の並び順
     */
    private constructor(sort: RankingSortType) {
        this._value = sort;
    }

    get value() {
        return this._value;
    }

    /**
     * 外部からの入力値から生成する
     * @param sort 並び順（省略時は DEFAULT）
     * @returns 成功時は並び順、許容値以外の場合はその内容を持つ Result
     */
    static create(sort: string | undefined): Result<RankingSort, RankingSortError> {
        if (sort === undefined) {
            return ok(new RankingSort(RankingSort.DEFAULT));
        }

        const value = RankingSort.VALUES.find((e) => e === sort);
        if (value === undefined) {
            return err({ type: "RANKING_SORT_INVALID" });
        }

        return ok(new RankingSort(value));
    }
}
