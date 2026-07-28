import { describe, it, expect, vi } from "vitest";
import { FrontUserName } from "../../src/domain";

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
}));

describe("FrontUserName", () => {
  it("正常な名前でインスタンスを生成できること", () => {
    const userName = new FrontUserName("testuser");
    expect(userName.value).toBe("testuser");
  });

  it("日本語の名前でも生成できること", () => {
    const userName = new FrontUserName("テストユーザー");
    expect(userName.value).toBe("テストユーザー");
  });

  it("空文字でエラーになること", () => {
    expect(() => new FrontUserName("")).toThrow(
      "ユーザー名が設定されていません。"
    );
  });

  it("equalsで同じ値を比較できること", () => {
    const userName1 = new FrontUserName("testuser");
    const userName2 = new FrontUserName("testuser");
    expect(userName1.equals(userName2)).toBe(true);
  });

  it("equalsで異なる値を比較できること", () => {
    const userName1 = new FrontUserName("testuser");
    const userName2 = new FrontUserName("otheruser");
    expect(userName1.equals(userName2)).toBe(false);
  });
});
