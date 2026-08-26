import { describe, it, expect } from "vitest";
import { ItemName } from "../../src/domain/my-ranking/value-object/item-name/item-name";

describe("ItemName", () => {
  it("通常の文字列を保持できること", () => {
    const itemName = new ItemName("ラーメン");
    expect(itemName.value).toBe("ラーメン");
  });

  it("前後の空白をトリムすること", () => {
    const itemName = new ItemName("  ラーメン  ");
    expect(itemName.value).toBe("ラーメン");
  });

  it("空文字の場合はnullを保持すること（未入力項目として扱うため）", () => {
    const itemName = new ItemName("");
    expect(itemName.value).toBeNull();
  });

  it("空白のみの場合はnullを保持すること", () => {
    const itemName = new ItemName("   ");
    expect(itemName.value).toBeNull();
  });

  it("nullを渡した場合もnullを保持すること", () => {
    const itemName = new ItemName(null);
    expect(itemName.value).toBeNull();
  });

  it("最大文字数を超える場合は例外を投げること", () => {
    const tooLong = "あ".repeat(ItemName.MAX_LENGTH + 1);
    expect(() => new ItemName(tooLong)).toThrow(`項目名は${ItemName.MAX_LENGTH}文字以内で入力してください。`);
  });
});
