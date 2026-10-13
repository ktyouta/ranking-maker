import { describe, expect, it } from "vitest";
import { TrashRankingSort } from "./trash-ranking-sort";

describe("TrashRankingSort", () => {
  describe("create", () => {
    it.each(TrashRankingSort.VALUES)("許容値 %s を保持できること", (value) => {
      expect(TrashRankingSort.create(value)._unsafeUnwrap().value).toBe(value);
    });

    it("省略時は既定値を保持すること", () => {
      expect(TrashRankingSort.create(undefined)._unsafeUnwrap().value).toBe(TrashRankingSort.DEFAULT);
    });

    it("ゴミ箱にはお気に入りがないため、favoriteDesc は TRASH_RANKING_SORT_INVALID を返すこと", () => {
      expect(TrashRankingSort.create("favoriteDesc")._unsafeUnwrapErr()).toEqual({ type: "TRASH_RANKING_SORT_INVALID" });
    });

    it.each(["nameAsc", ""])("許容値以外（%j）の場合は TRASH_RANKING_SORT_INVALID を返すこと", (value) => {
      expect(TrashRankingSort.create(value)._unsafeUnwrapErr()).toEqual({ type: "TRASH_RANKING_SORT_INVALID" });
    });
  });

  it("既定値は許容値に含まれること", () => {
    expect(TrashRankingSort.VALUES).toContain(TrashRankingSort.DEFAULT);
  });
});
