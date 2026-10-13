import { describe, expect, it } from "vitest";
import { UserTheme } from "./user-theme";

describe("UserTheme", () => {
  describe("create", () => {
    it.each(UserTheme.VALUES)("許容値 %s で生成できること", (theme) => {
      expect(UserTheme.create(theme)._unsafeUnwrap().value).toBe(theme);
    });

    it.each(["blue", ""])("許容値以外（%j）の場合、USER_THEME_INVALID を返すこと", (theme) => {
      expect(UserTheme.create(theme)._unsafeUnwrapErr()).toEqual({ type: "USER_THEME_INVALID" });
    });
  });

  describe("of", () => {
    it("許容値で生成できること", () => {
      expect(UserTheme.of(UserTheme.TEAL).value).toBe(UserTheme.TEAL);
    });

    it("許容値以外の場合は throw すること", () => {
      expect(() => UserTheme.of("blue")).toThrow("テーマが不正です。type:USER_THEME_INVALID value:blue");
    });
  });

  it("default は lavender であること", () => {
    expect(UserTheme.default().value).toBe(UserTheme.LAVENDER);
  });
});
