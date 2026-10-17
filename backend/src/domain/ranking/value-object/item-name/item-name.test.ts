import { describe, it, expect } from "vitest";
import { ItemName } from "./item-name";

describe("ItemName", () => {
  describe("create", () => {
    it("通常の文字列を保持できること", () => {
      expect(ItemName.create("ラーメン")._unsafeUnwrap().value).toBe("ラーメン");
    });

    it("前後の空白をトリムすること", () => {
      expect(ItemName.create("  ラーメン  ")._unsafeUnwrap().value).toBe("ラーメン");
    });

    it.each(["", "   ", null])("「%s」の場合はnullを保持すること（未入力項目として扱うため）", (itemName) => {
      expect(ItemName.create(itemName)._unsafeUnwrap().value).toBeNull();
    });

    it("上限文字数ちょうどで生成できること", () => {
      expect(ItemName.create("あ".repeat(ItemName.MAX_LENGTH))._unsafeUnwrap().value).toHaveLength(ItemName.MAX_LENGTH);
    });

    it("上限文字数を超える場合、ITEM_NAME_TOO_LONG を上限文字数とともに返すこと", () => {
      expect(ItemName.create("あ".repeat(ItemName.MAX_LENGTH + 1))._unsafeUnwrapErr()).toEqual({ type: "ITEM_NAME_TOO_LONG", max: ItemName.MAX_LENGTH });
    });
  });

  describe("of", () => {
    it("制約を満たす値で生成できること", () => {
      expect(ItemName.of("ラーメン").value).toBe("ラーメン");
    });

    it("制約を満たさない値の場合は throw すること", () => {
      expect(() => ItemName.of("あ".repeat(ItemName.MAX_LENGTH + 1))).toThrow();
    });
  });
});
