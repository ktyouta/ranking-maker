import { describe, it, expect } from "vitest";
import { LoginId } from "../../..";

describe("LoginId", () => {
  describe("create", () => {
    it.each(["a", "testuser", "あ".repeat(31)])("空でなければ（%s）、そのまま保持すること（ユーザー名の文字数は判定しない）", (name) => {
      expect(LoginId.create(name)._unsafeUnwrap().value).toBe(name);
    });

    it("空の場合、LOGIN_ID_EMPTY を返すこと", () => {
      expect(LoginId.create("")._unsafeUnwrapErr()).toEqual({ type: "LOGIN_ID_EMPTY" });
    });
  });

  describe("of", () => {
    it("空でなければ、そのまま保持すること", () => {
      expect(LoginId.of("testuser").value).toBe("testuser");
    });

    it("空の場合、throw すること", () => {
      expect(() => LoginId.of("")).toThrow("ログインIDが不正です。type:LOGIN_ID_EMPTY");
    });
  });
});
