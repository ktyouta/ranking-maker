import { describe, expect, it } from "vitest";
import { RankingSort } from "./ranking-sort";

describe("RankingSort", () => {
  describe("create", () => {
    it.each(RankingSort.VALUES)("許容値 %s を保持できること", (value) => {
      expect(RankingSort.create(value)._unsafeUnwrap().value).toBe(value);
    });

    it("省略時は既定値を保持すること", () => {
      expect(RankingSort.create(undefined)._unsafeUnwrap().value).toBe(RankingSort.DEFAULT);
    });

    it.each(["nameAsc", ""])("許容値以外（%j）の場合は RANKING_SORT_INVALID を返すこと", (value) => {
      expect(RankingSort.create(value)._unsafeUnwrapErr()).toEqual({ type: "RANKING_SORT_INVALID" });
    });
  });

  it("既定値は許容値に含まれること", () => {
    expect(RankingSort.VALUES).toContain(RankingSort.DEFAULT);
  });
});
