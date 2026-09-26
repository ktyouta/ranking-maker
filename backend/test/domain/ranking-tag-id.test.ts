import { describe, it, expect } from "vitest";
import { RankingTagId } from "../../src/domain";

describe("RankingTagId", () => {
  it("generate: 空でないIDを生成すること", () => {
    expect(RankingTagId.generate().value).not.toBe("");
  });

  it("of: 指定したIDを保持すること", () => {
    expect(RankingTagId.of("ranking-tag-1").value).toBe("ranking-tag-1");
  });

  it("of: 空文字はエラーになること", () => {
    expect(() => RankingTagId.of("")).toThrow();
  });
});
