import { describe, it, expect } from "vitest";
import { ContentModerationTarget } from "../../src/domain";

describe("ContentModerationTarget", () => {
  it("項目を持たない判定対象は項目の位置を持たないこと", () => {
    expect(ContentModerationTarget.title("タイトル").itemIndex).toBeNull();
    expect(ContentModerationTarget.memo("メモ").itemIndex).toBeNull();
    expect(ContentModerationTarget.tagName("タグ").itemIndex).toBeNull();
  });

  it("項目の判定対象は種類・値・項目の位置を保持すること", () => {
    const target = ContentModerationTarget.itemName(2, "ラーメン");

    expect(target.type).toBe("ITEM_NAME");
    expect(target.value).toBe("ラーメン");
    expect(target.itemIndex).toBe(2);
  });

  it("値が空の場合はエラーになること", () => {
    expect(() => ContentModerationTarget.title("")).toThrow();
  });

  it("項目の位置が負の数の場合はエラーになること", () => {
    expect(() => ContentModerationTarget.itemMemo(-1, "メモ")).toThrow();
  });

  it("項目の位置が整数でない場合はエラーになること", () => {
    expect(() => ContentModerationTarget.itemName(0.5, "ラーメン")).toThrow();
  });
});
