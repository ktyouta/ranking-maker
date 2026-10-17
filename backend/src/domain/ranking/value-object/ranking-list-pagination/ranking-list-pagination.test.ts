import { describe, expect, it } from "vitest";
import { RankingListPagination } from "./ranking-list-pagination";

describe("RankingListPagination", () => {
  describe("create", () => {
    it("1以上の整数の場合、指定したページ番号を保持すること", () => {
      expect(RankingListPagination.create(2)._unsafeUnwrap().value).toBe(2);
    });

    it("省略時は1ページ目を保持すること", () => {
      expect(RankingListPagination.create(undefined)._unsafeUnwrap().value).toBe(RankingListPagination.MIN_PAGE);
    });

    it.each([0, -1, 1.5, NaN])("page=%s の場合、RANKING_LIST_PAGE_INVALID を最小値とともに返すこと", (page) => {
      expect(RankingListPagination.create(page)._unsafeUnwrapErr()).toEqual({
        type: "RANKING_LIST_PAGE_INVALID",
        min: RankingListPagination.MIN_PAGE,
      });
    });
  });
});
