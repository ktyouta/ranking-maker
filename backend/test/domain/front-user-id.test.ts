import { describe, it, expect, vi } from "vitest";
import { FrontUserId } from "../../src/domain";

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
}));

describe("FrontUserId", () => {
  it("正常なIDでインスタンスを生成できること", () => {
    const userId = FrontUserId.of(1);
    expect(userId.value).toBe(1);
  });

  it("大きな数値でも生成できること", () => {
    const userId = FrontUserId.of(999999);
    expect(userId.value).toBe(999999);
  });

  it("0のIDでエラーになること", () => {
    expect(() => FrontUserId.of(0)).toThrow("ユーザーIDが設定されていません。");
  });

  // 注: 現在の実装では負の数はバリデーションされない
  // 必要に応じて実装を修正することを検討
  it("負の数でもインスタンスが生成されること（現在の実装の動作）", () => {
    const userId = FrontUserId.of(-1);
    expect(userId.value).toBe(-1);
  });
});
