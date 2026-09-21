import { describe, expect, it } from "vitest";
import { TrashRankingSort } from "../../src/domain/my-ranking/value-object/trash-ranking-sort/trash-ranking-sort";

describe("TrashRankingSort", () => {
  it.each(TrashRankingSort.VALUES)("許容値 %s を保持できること", (value) => {
    const sort = new TrashRankingSort(value);
    expect(sort.value).toBe(value);
  });

  it("既定値は許容値に含まれること", () => {
    expect(TrashRankingSort.VALUES).toContain(TrashRankingSort.DEFAULT);
  });

  it("ゴミ箱にはお気に入りがないため、favoriteDesc は許容しないこと", () => {
    expect(() => new TrashRankingSort("favoriteDesc")).toThrow("ゴミ箱の並び順が不正です。value:favoriteDesc");
  });

  it("許容値以外の場合は例外を投げること", () => {
    expect(() => new TrashRankingSort("nameAsc")).toThrow("ゴミ箱の並び順が不正です。value:nameAsc");
  });
});
