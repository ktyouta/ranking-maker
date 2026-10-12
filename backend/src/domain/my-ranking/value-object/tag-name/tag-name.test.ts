import { describe, it, expect } from "vitest";
import { TagName } from "./tag-name";

describe("TagName", () => {
  describe("create", () => {
    it("前後の空白を除去して保持すること", () => {
      expect(TagName.create(" ラーメン ")._unsafeUnwrap().value).toBe("ラーメン");
    });

    it("上限文字数ちょうどで生成できること", () => {
      expect(TagName.create("あ".repeat(TagName.MAX_LENGTH))._unsafeUnwrap().value).toHaveLength(TagName.MAX_LENGTH);
    });

    it.each(["", "   "])("「%s」の場合、TAG_NAME_EMPTY を返すこと", (tagName) => {
      expect(TagName.create(tagName)._unsafeUnwrapErr()).toEqual({ type: "TAG_NAME_EMPTY" });
    });

    it("上限文字数を超える場合、TAG_NAME_TOO_LONG を上限文字数とともに返すこと", () => {
      expect(TagName.create("あ".repeat(TagName.MAX_LENGTH + 1))._unsafeUnwrapErr()).toEqual({ type: "TAG_NAME_TOO_LONG", max: TagName.MAX_LENGTH });
    });

    it("区切り文字を含む場合、TAG_NAME_INVALID_CHARACTER を区切り文字とともに返すこと", () => {
      expect(TagName.create(`ラーメン${TagName.SEPARATOR}東京`)._unsafeUnwrapErr()).toEqual({ type: "TAG_NAME_INVALID_CHARACTER", separator: TagName.SEPARATOR });
    });
  });

  describe("of", () => {
    it("制約を満たす値で生成できること", () => {
      expect(TagName.of("ラーメン").value).toBe("ラーメン");
    });

    it("制約を満たさない値の場合は throw すること", () => {
      expect(() => TagName.of("")).toThrow();
    });
  });
});
