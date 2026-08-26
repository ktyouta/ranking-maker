import { describe, it, expect } from "vitest";
import {
  ItemMemo,
  ItemName,
  Order,
  PublicStatus,
  RankingAggregate,
  RankingId,
  RankingMemo,
  RankingOrderEntity,
  RankingOrderId,
  RankingTitle,
} from "../../src/domain";
import { UserId } from "../../src/domain/user";

function buildBaseParams() {
  return {
    rankingId: RankingId.generate(),
    rankingTitle: new RankingTitle("テストランキング"),
    publicStatus: new PublicStatus(1),
    memo: new RankingMemo(""),
    userId: UserId.generate(),
  };
}

describe("RankingAggregate", () => {
  it("項目名が未入力(null)の項目が複数あっても重複エラーにならないこと", () => {
    const items = [
      new RankingOrderEntity(RankingOrderId.generate(), new ItemName(""), new Order(1), new ItemMemo("")),
      new RankingOrderEntity(RankingOrderId.generate(), new ItemName(""), new Order(2), new ItemMemo("")),
      new RankingOrderEntity(RankingOrderId.generate(), new ItemName(""), new Order(3), new ItemMemo("")),
    ];

    const result = RankingAggregate.create({ ...buildBaseParams(), rankingOrderEntityList: items });

    expect(result.isOk()).toBe(true);
  });

  it("項目名が入力されていて重複している場合はエラーになること", () => {
    const items = [
      new RankingOrderEntity(RankingOrderId.generate(), new ItemName("ラーメン"), new Order(1), new ItemMemo("")),
      new RankingOrderEntity(RankingOrderId.generate(), new ItemName("ラーメン"), new Order(2), new ItemMemo("")),
    ];

    const result = RankingAggregate.create({ ...buildBaseParams(), rankingOrderEntityList: items });

    expect(result.isErr()).toBe(true);
  });

  it("項目名が未入力(null)の項目は不適切内容チェックの対象に含めないこと", () => {
    const items = [
      new RankingOrderEntity(RankingOrderId.generate(), new ItemName(""), new Order(1), new ItemMemo("")),
      new RankingOrderEntity(RankingOrderId.generate(), new ItemName("ラーメン"), new Order(2), new ItemMemo("")),
    ];

    const result = RankingAggregate.create({ ...buildBaseParams(), rankingOrderEntityList: items });
    if (result.isErr()) {
      throw new Error("unexpected error");
    }

    const targets = result.value.toModerationTargets();
    const itemNameTargets = targets.filter((t) => t.field.startsWith("項目名"));

    expect(itemNameTargets).toHaveLength(1);
    expect(itemNameTargets[0].value).toBe("ラーメン");
  });
});
