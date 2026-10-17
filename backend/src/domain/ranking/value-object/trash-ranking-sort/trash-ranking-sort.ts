import { err, ok, type Result } from "neverthrow";

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
 * ゴミ箱のランキング一覧の並び順の生成失敗
 */
export type TrashRankingSortError = { type: "TRASH_RANKING_SORT_INVALID" };

/**
 * ゴミ箱のランキング一覧の並び順（updatedAt は削除日時に転用した値を表す）
 */
export class TrashRankingSort {

    static readonly VALUES = VALUES;
    static readonly DEFAULT: TrashRankingSortType = "updatedAtDesc";

    private readonly _value: TrashRankingSortType;

    /**
     * @param sort 許容値の並び順
     */
    private constructor(sort: TrashRankingSortType) {
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
    static create(sort: string | undefined): Result<TrashRankingSort, TrashRankingSortError> {
        if (sort === undefined) {
            return ok(new TrashRankingSort(TrashRankingSort.DEFAULT));
        }

        const value = TrashRankingSort.VALUES.find((e) => e === sort);
        if (value === undefined) {
            return err({ type: "TRASH_RANKING_SORT_INVALID" });
        }

        return ok(new TrashRankingSort(value));
    }
}
