import { describe, expect, it } from "vitest";
import { UpdateRankingSchema } from "./update-ranking.schema";

function buildBody(overrides: Record<string, unknown> = {}) {
  return {
    title: "テストランキング",
    publicStatus: 1,
    icon: 1,
    memo: "",
    items: [{ itemName: "ラーメン", order: 1, memo: "" }],
    tags: ["ラーメン"],
    ...overrides,
  };
}

describe("UpdateRankingSchema", () => {
  it("型・構造が正しい場合は通過すること", () => {
    expect(UpdateRankingSchema.safeParse(buildBody()).success).toBe(true);
  });

  it("値の制約（空のタイトル・重複タグ・上限超過等）は判定せず通過すること", () => {
    const result = UpdateRankingSchema.safeParse(buildBody({
      title: "",
      publicStatus: 99,
      icon: 0,
      items: [{ itemName: "あ".repeat(1000), order: 0, memo: "" }],
      tags: ["", "ラーメン", "ラーメン"],
    }));

    expect(result.success).toBe(true);
  });

  it("メモを省略した場合は型違反になること", () => {
    const result = UpdateRankingSchema.safeParse(buildBody({ memo: undefined, items: [{ itemName: "ラーメン", order: 1 }] }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((e) => e.path.join("."))).toEqual(["memo", "items.0.memo"]);
    }
  });

  it("型が違反している項目は、その path でエラーになること", () => {
    const result = UpdateRankingSchema.safeParse(buildBody({ title: 1, items: [{ itemName: "ラーメン", order: "1", memo: "" }], tags: [1] }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((e) => e.path.join("."))).toEqual(["title", "items.0.order", "tags.0"]);
    }
  });
});
