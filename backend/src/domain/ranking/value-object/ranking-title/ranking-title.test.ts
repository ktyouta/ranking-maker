import { describe, it, expect } from "vitest";
import { RankingTitle } from "./ranking-title";

describe("RankingTitle", () => {
  describe("create", () => {
    it("正常なタイトルで生成できること", () => {
      expect(RankingTitle.create("好きなラーメン")._unsafeUnwrap().value).toBe("好きなラーメン");
    });

    it("前後の空白を除去して保持すること", () => {
      expect(RankingTitle.create("  好きなラーメン　")._unsafeUnwrap().value).toBe("好きなラーメン");
    });

    it("上限文字数ちょうどで生成できること", () => {
      expect(RankingTitle.create("あ".repeat(RankingTitle.MAX_LENGTH))._unsafeUnwrap().value).toHaveLength(RankingTitle.MAX_LENGTH);
    });

    it.each(["", "   "])("「%s」の場合、RANKING_TITLE_EMPTY を返すこと", (title) => {
      expect(RankingTitle.create(title)._unsafeUnwrapErr()).toEqual({ type: "RANKING_TITLE_EMPTY" });
    });

    it("上限文字数を超える場合、RANKING_TITLE_TOO_LONG を上限文字数とともに返すこと", () => {
      expect(RankingTitle.create("あ".repeat(RankingTitle.MAX_LENGTH + 1))._unsafeUnwrapErr()).toEqual({ type: "RANKING_TITLE_TOO_LONG", max: RankingTitle.MAX_LENGTH });
    });
  });

  describe("of", () => {
    it("制約を満たす値で生成できること", () => {
      expect(RankingTitle.of("好きなラーメン").value).toBe("好きなラーメン");
    });

    it("制約を満たさない値の場合は throw すること", () => {
      expect(() => RankingTitle.of("")).toThrow();
    });
  });
});
