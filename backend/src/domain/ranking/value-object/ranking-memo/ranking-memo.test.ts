import { describe, it, expect } from "vitest";
import { RankingMemo } from "./ranking-memo";

describe("RankingMemo", () => {
  describe("create", () => {
    it("前後の空白を除去せずに保持すること", () => {
      expect(RankingMemo.create(" メモ ")._unsafeUnwrap().value).toBe(" メモ ");
    });

    it("null を保持できること", () => {
      expect(RankingMemo.create(null)._unsafeUnwrap().value).toBeNull();
    });

    it("上限文字数ちょうどで生成できること", () => {
      expect(RankingMemo.create("あ".repeat(RankingMemo.MAX_LENGTH))._unsafeUnwrap().value).toHaveLength(RankingMemo.MAX_LENGTH);
    });

    it("上限文字数を超える場合、RANKING_MEMO_TOO_LONG を上限文字数とともに返すこと", () => {
      expect(RankingMemo.create("あ".repeat(RankingMemo.MAX_LENGTH + 1))._unsafeUnwrapErr()).toEqual({ type: "RANKING_MEMO_TOO_LONG", max: RankingMemo.MAX_LENGTH });
    });
  });

  describe("of", () => {
    it("制約を満たす値で生成できること", () => {
      expect(RankingMemo.of("メモ").value).toBe("メモ");
    });

    it("制約を満たさない値の場合は throw すること", () => {
      expect(() => RankingMemo.of("あ".repeat(RankingMemo.MAX_LENGTH + 1))).toThrow();
    });
  });
});
