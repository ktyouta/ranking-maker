import { describe, expect, it } from "vitest";
import { RankingSort } from "../../src/domain/my-ranking/value-object/ranking-sort/ranking-sort";

describe("RankingSort", () => {
  it.each(RankingSort.VALUES)("許容値 %s を保持できること", (value) => {
    const sort = new RankingSort(value);
    expect(sort.value).toBe(value);
  });

  it("既定値は許容値に含まれること", () => {
    expect(RankingSort.VALUES).toContain(RankingSort.DEFAULT);
  });

  it("許容値以外の場合は例外を投げること", () => {
    expect(() => new RankingSort("nameAsc")).toThrow("マイランキングの並び順が不正です。value:nameAsc");
  });

  it("空文字の場合は例外を投げること", () => {
    expect(() => new RankingSort("")).toThrow("マイランキングの並び順が不正です。value:");
  });
});
