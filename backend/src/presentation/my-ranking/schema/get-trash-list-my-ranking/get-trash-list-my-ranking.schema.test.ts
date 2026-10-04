import { describe, expect, it } from "vitest";
import { RankingAggregate, TagName } from "../../../../domain";
import { GetTrashListMyRankingQuerySchema } from "./get-trash-list-my-ranking.schema";

describe("GetTrashListMyRankingQuerySchema の tags", () => {
  it("指定がない場合は空配列になること", () => {
    const result = GetTrashListMyRankingQuerySchema.safeParse({});

    expect(result.success && result.data.tags).toEqual([]);
  });

  it("空文字の場合は空配列になること", () => {
    const result = GetTrashListMyRankingQuerySchema.safeParse({ tags: "" });

    expect(result.success && result.data.tags).toEqual([]);
  });

  it("1個だけ指定された場合は要素1つの配列になること", () => {
    const result = GetTrashListMyRankingQuerySchema.safeParse({ tags: "ラーメン" });

    expect(result.success && result.data.tags).toEqual(["ラーメン"]);
  });

  it("区切り文字でつながれた場合は分割し、前後の空白を除いた配列になること", () => {
    const result = GetTrashListMyRankingQuerySchema.safeParse({ tags: ["ラーメン", " 東京 "].join(TagName.SEPARATOR) });

    expect(result.success && result.data.tags).toEqual(["ラーメン", "東京"]);
  });

  it("区切り文字の間が空の場合はエラーになること", () => {
    expect(GetTrashListMyRankingQuerySchema.safeParse({ tags: ["ラーメン", "", "東京"].join(TagName.SEPARATOR) }).success).toBe(false);
  });

  it("空白だけのタグはエラーになること", () => {
    expect(GetTrashListMyRankingQuerySchema.safeParse({ tags: "  " }).success).toBe(false);
  });

  it("タグ名の上限文字数を超える場合はエラーになること", () => {
    expect(GetTrashListMyRankingQuerySchema.safeParse({ tags: "あ".repeat(TagName.MAX_LENGTH + 1) }).success).toBe(false);
  });

  it("タグが上限件数ちょうどの場合はバリデーションを通過すること", () => {
    const tags = Array.from({ length: RankingAggregate.MAX_TAG_COUNT }, (_, i) => `タグ${i}`);

    expect(GetTrashListMyRankingQuerySchema.safeParse({ tags: tags.join(TagName.SEPARATOR) }).success).toBe(true);
  });

  it("タグが上限件数を超える場合はエラーになること", () => {
    const tags = Array.from({ length: RankingAggregate.MAX_TAG_COUNT + 1 }, (_, i) => `タグ${i}`);

    expect(GetTrashListMyRankingQuerySchema.safeParse({ tags: tags.join(TagName.SEPARATOR) }).success).toBe(false);
  });
});
