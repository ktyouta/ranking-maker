import { err, ok, type Result } from "neverthrow";

/**
 * ランキング一覧のページング条件の生成失敗
 */
export type RankingListPaginationError = { type: "RANKING_LIST_PAGE_INVALID"; min: number };

/**
 * ランキング一覧（マイランキング一覧・ゴミ箱一覧）のページング条件
 */
export class RankingListPagination {

    static readonly MIN_PAGE = 1;
    private readonly _value: number;

    /**
     * @param page ページ番号（1始まり）
     */
    private constructor(page: number) {
        this._value = page;
    }

    get value() {
        return this._value;
    }

    /**
     * 外部からの入力値から生成する
     * @param page ページ番号（1始まり。省略時は MIN_PAGE）
     * @returns 成功時はページング条件、MIN_PAGE 以上の整数でない場合（NaN を含む）はその内容を持つ Result
     */
    static create(page: number | undefined): Result<RankingListPagination, RankingListPaginationError> {
        if (page === undefined) {
            return ok(new RankingListPagination(RankingListPagination.MIN_PAGE));
        }

        if (!Number.isInteger(page) || page < RankingListPagination.MIN_PAGE) {
            return err({ type: "RANKING_LIST_PAGE_INVALID", min: RankingListPagination.MIN_PAGE });
        }

        return ok(new RankingListPagination(page));
    }
}
