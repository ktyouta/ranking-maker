import { describe, expect, it } from "vitest";
import { TagName } from "../../../../domain";
import { GetListRankingQuerySchema } from "./get-list-ranking.schema";

describe("GetListRankingQuerySchema", () => {
  it("値の制約（空のタグ・上限超過・許容値以外の並び順・不正なページ番号等）は判定せず通過すること", () => {
    const result = GetListRankingQuerySchema.safeParse({
      tags: ["", "あ".repeat(TagName.MAX_LENGTH + 1)].join(TagName.SEPARATOR),
      sort: "nameAsc",
      page: "abc",
    });

    expect(result.success).toBe(true);
  });

  describe("tags", () => {
    it("指定がない場合は空配列になること", () => {
      const result = GetListRankingQuerySchema.safeParse({});

      expect(result.success && result.data.tags).toEqual([]);
    });

    it("空文字の場合は空配列になること", () => {
      const result = GetListRankingQuerySchema.safeParse({ tags: "" });

      expect(result.success && result.data.tags).toEqual([]);
    });

    it("区切り文字でつながれた場合は、前後の空白を残したまま分割した配列になること", () => {
      const result = GetListRankingQuerySchema.safeParse({ tags: ["ラーメン", " 東京 "].join(TagName.SEPARATOR) });

      expect(result.success && result.data.tags).toEqual(["ラーメン", " 東京 "]);
    });
  });

  describe("sort", () => {
    it("指定がない場合は省略のまま（既定値を入れない）であること", () => {
      const result = GetListRankingQuerySchema.safeParse({});

      expect(result.success && result.data.sort).toBeUndefined();
    });
  });

  describe("page", () => {
    it("数値に変換すること", () => {
      const result = GetListRankingQuerySchema.safeParse({ page: "2" });

      expect(result.success && result.data.page).toBe(2);
    });

    it.each([undefined, ""])("%j の場合は省略として扱うこと", (page) => {
      const result = GetListRankingQuerySchema.safeParse({ page });

      expect(result.success && result.data.page).toBeUndefined();
    });
  });
});
