import { describe, it, expect } from "vitest";
import { ItemMemo } from "./item-memo";

describe("ItemMemo", () => {
  describe("create", () => {
    it("前後の空白を除去せずに保持すること", () => {
      expect(ItemMemo.create(" メモ ")._unsafeUnwrap().value).toBe(" メモ ");
    });

    it("上限文字数ちょうどで生成できること", () => {
      expect(ItemMemo.create("あ".repeat(ItemMemo.MAX_LENGTH))._unsafeUnwrap().value).toHaveLength(ItemMemo.MAX_LENGTH);
    });

    it("上限文字数を超える場合、ITEM_MEMO_TOO_LONG を上限文字数とともに返すこと", () => {
      expect(ItemMemo.create("あ".repeat(ItemMemo.MAX_LENGTH + 1))._unsafeUnwrapErr()).toEqual({ type: "ITEM_MEMO_TOO_LONG", max: ItemMemo.MAX_LENGTH });
    });
  });

  describe("of", () => {
    it("制約を満たす値で生成できること", () => {
      expect(ItemMemo.of("メモ").value).toBe("メモ");
    });

    it("制約を満たさない値の場合は throw すること", () => {
      expect(() => ItemMemo.of("あ".repeat(ItemMemo.MAX_LENGTH + 1))).toThrow();
    });
  });
});
