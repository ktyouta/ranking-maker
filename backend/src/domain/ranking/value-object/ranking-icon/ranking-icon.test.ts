import { describe, it, expect } from "vitest";
import { RankingIcon } from "./ranking-icon";

describe("RankingIcon", () => {
  describe("create", () => {
    it("1以上の整数で生成できること", () => {
      expect(RankingIcon.create(1)._unsafeUnwrap().value).toBe(1);
    });

    it.each([0, -1, 1.5])("「%s」の場合、RANKING_ICON_INVALID を返すこと", (iconId) => {
      expect(RankingIcon.create(iconId)._unsafeUnwrapErr()).toEqual({ type: "RANKING_ICON_INVALID" });
    });
  });

  describe("of", () => {
    it("制約を満たす値で生成できること", () => {
      expect(RankingIcon.of(2).value).toBe(2);
    });

    it("制約を満たさない値の場合は throw すること", () => {
      expect(() => RankingIcon.of(0)).toThrow();
    });
  });
});
