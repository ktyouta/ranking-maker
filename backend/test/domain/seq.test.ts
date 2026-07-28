import { describe, it, expect, vi } from "vitest";
import { SeqKey } from "../../src/domain";

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
}));

describe("SeqKey", () => {
  it("正常なキーでインスタンスを生成できること", () => {
    const key = new SeqKey("front_user_id");
    expect(key.value).toBe("front_user_id");
  });

  it("空文字でエラーになること", () => {
    expect(() => new SeqKey("")).toThrow(
      "シーケンスキーが設定されていません。"
    );
  });

  it("様々な形式のキーを受け付けること", () => {
    const key1 = new SeqKey("sample_id");
    const key2 = new SeqKey("SampleId");
    const key3 = new SeqKey("sample-id");

    expect(key1.value).toBe("sample_id");
    expect(key2.value).toBe("SampleId");
    expect(key3.value).toBe("sample-id");
  });
});
