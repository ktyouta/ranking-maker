import { UserIdParamSchema } from "src/schema";
import { describe, expect, it } from "vitest";
import {
  CreateFrontUserSchema,
  UpdateFrontUserSchema,
} from "../../../../src/api/front-user/schema";

describe("FrontUser Schema Validation", () => {
  describe("CreateFrontUserSchema", () => {
    it("正常なデータでバリデーションを通過すること", () => {
      const result = CreateFrontUserSchema.safeParse({
        name: "testuser",
        birthday: "19900101",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("ユーザー名が3文字未満の場合にエラーになること", () => {
      const result = CreateFrontUserSchema.safeParse({
        name: "ab",
        birthday: "19900101",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "ユーザー名は3文字以上で入力してください"
        );
      }
    });

    it("ユーザー名が30文字を超える場合にエラーになること", () => {
      const result = CreateFrontUserSchema.safeParse({
        name: "a".repeat(31),
        birthday: "19900101",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "ユーザー名は30文字以内で入力してください"
        );
      }
    });

    it("生年月日が不正な形式の場合にエラーになること", () => {
      const result = CreateFrontUserSchema.safeParse({
        name: "testuser",
        birthday: "1990-01-01",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "生年月日は日付形式(yyyyMMdd)で入力してください"
        );
      }
    });

    it("パスワードが8文字未満の場合にエラーになること", () => {
      const result = CreateFrontUserSchema.safeParse({
        name: "testuser",
        birthday: "19900101",
        password: "pass123",
        confirmPassword: "pass123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "パスワードは8文字以上で入力してください"
        );
      }
    });

    it("パスワードに全角文字が含まれる場合にエラーになること", () => {
      const result = CreateFrontUserSchema.safeParse({
        name: "testuser",
        birthday: "19900101",
        password: "パスワード123",
        confirmPassword: "パスワード123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "パスワードは半角英数記号で入力してください"
        );
      }
    });

    it("確認用パスワードが一致しない場合にエラーになること", () => {
      const result = CreateFrontUserSchema.safeParse({
        name: "testuser",
        birthday: "19900101",
        password: "password123",
        confirmPassword: "password456",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "確認用パスワードが一致しません。"
        );
      }
    });
  });

  describe("UpdateFrontUserSchema", () => {
    it("正常なデータでバリデーションを通過すること", () => {
      const result = UpdateFrontUserSchema.safeParse({
        name: "updateduser",
        birthday: "19950515",
      });
      expect(result.success).toBe(true);
    });

    it("ユーザー名が3文字未満の場合にエラーになること", () => {
      const result = UpdateFrontUserSchema.safeParse({
        name: "ab",
        birthday: "19950515",
      });
      expect(result.success).toBe(false);
    });

    it("生年月日が不正な形式の場合にエラーになること", () => {
      const result = UpdateFrontUserSchema.safeParse({
        name: "updateduser",
        birthday: "invalid",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("UserIdParamSchema", () => {
    it("正常な数値文字列でバリデーションを通過すること", () => {
      const result = UserIdParamSchema.safeParse({ userId: "123" });
      expect(result.success).toBe(true);
    });

    it("数値以外の文字列の場合にエラーになること", () => {
      const result = UserIdParamSchema.safeParse({ userId: "abc" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "ユーザーIDは数値で指定してください"
        );
      }
    });
  });
});
