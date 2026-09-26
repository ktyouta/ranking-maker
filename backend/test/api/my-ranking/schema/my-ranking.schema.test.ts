import { describe, expect, it } from "vitest";
import { RankingAggregate } from "../../../../src/domain";
import { CreateMyRankingSchema, UpdateMyRankingSchema } from "../../../../src/presentation/my-ranking/schema";

function buildBody(tags: string[]) {
  return {
    title: "テストランキング",
    publicStatus: 1,
    icon: 1,
    memo: "",
    items: [{ itemName: "ラーメン", order: 1, memo: "" }],
    tags,
  };
}

describe("My Ranking Schema Validation", () => {
  for (const [name, schema] of [["CreateMyRankingSchema", CreateMyRankingSchema], ["UpdateMyRankingSchema", UpdateMyRankingSchema]] as const) {
    describe(name, () => {
      it("重複のないタグはバリデーションを通過すること", () => {
        expect(schema.safeParse(buildBody(["ラーメン", "寿司"])).success).toBe(true);
      });

      it("同じタグ名が重複している場合は、重複したタグ名を含むエラーを1件返すこと", () => {
        const result = schema.safeParse(buildBody(["ラーメン", "寿司", "ラーメン", "ラーメン"]));

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues).toHaveLength(1);
          expect(result.error.issues[0].message).toBe("タグが重複しています: ラーメン");
          expect(result.error.issues[0].path).toEqual(["tags", 2]);
        }
      });

      it("前後の空白を除いて同じタグ名は重複として扱うこと", () => {
        const result = schema.safeParse(buildBody(["ラーメン", " ラーメン "]));

        expect(result.success).toBe(false);
      });

      it("空白だけのタグはエラーになること", () => {
        expect(schema.safeParse(buildBody(["  "])).success).toBe(false);
      });

      it("タグが上限件数ちょうどの場合はバリデーションを通過すること", () => {
        const tags = Array.from({ length: RankingAggregate.MAX_TAG_COUNT }, (_, i) => `タグ${i}`);

        expect(schema.safeParse(buildBody(tags)).success).toBe(true);
      });

      it("タグが上限件数を超える場合はエラーになること", () => {
        const tags = Array.from({ length: RankingAggregate.MAX_TAG_COUNT + 1 }, (_, i) => `タグ${i}`);
        const result = schema.safeParse(buildBody(tags));

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(`タグは${RankingAggregate.MAX_TAG_COUNT}個までです`);
        }
      });
    });
  }
});
