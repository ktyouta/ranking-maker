import { describe, it, expect } from "vitest";
import {
  ItemMemo,
  ItemName,
  Order,
  PublicStatus,
  RankingAggregate,
  RankingIcon,
  RankingId,
  RankingMemo,
  RankingOrderEntity,
  RankingOrderId,
  RankingTitle,
  TagId,
} from "../../src/domain";
import { UserId } from "../../src/domain/shared";

function buildBaseParams() {
  return {
    rankingId: RankingId.generate(),
    rankingTitle: new RankingTitle("テストランキング"),
    publicStatus: new PublicStatus(1),
    icon: new RankingIcon(1),
    memo: new RankingMemo(""),
    userId: UserId.generate(),
    tagIdList: [],
  };
}

describe("RankingAggregate", () => {
  it("項目名が未入力(null)の項目が複数あっても重複エラーにならないこと", () => {
    const items = [
      new RankingOrderEntity(RankingOrderId.generate(), new ItemName(""), new Order(1), new ItemMemo(""), false),
      new RankingOrderEntity(RankingOrderId.generate(), new ItemName(""), new Order(2), new ItemMemo(""), false),
      new RankingOrderEntity(RankingOrderId.generate(), new ItemName(""), new Order(3), new ItemMemo(""), false),
    ];

    const result = RankingAggregate.create({ ...buildBaseParams(), rankingOrderEntityList: items });

    expect(result.isOk()).toBe(true);
  });

  it("項目名が入力されていて重複している場合はエラーになること", () => {
    const items = [
      new RankingOrderEntity(RankingOrderId.generate(), new ItemName("ラーメン"), new Order(1), new ItemMemo(""), false),
      new RankingOrderEntity(RankingOrderId.generate(), new ItemName("ラーメン"), new Order(2), new ItemMemo(""), false),
    ];

    const result = RankingAggregate.create({ ...buildBaseParams(), rankingOrderEntityList: items });

    expect(result.isErr()).toBe(true);
  });

  it("項目名が未入力(null)の項目は不適切内容チェックの対象に含めないこと", () => {
    const items = [
      new RankingOrderEntity(RankingOrderId.generate(), new ItemName(""), new Order(1), new ItemMemo(""), false),
      new RankingOrderEntity(RankingOrderId.generate(), new ItemName("ラーメン"), new Order(2), new ItemMemo(""), false),
    ];

    const result = RankingAggregate.create({ ...buildBaseParams(), rankingOrderEntityList: items });
    if (result.isErr()) {
      throw new Error("unexpected error");
    }

    const targets = result.value.toModerationTargets();
    const itemNameTargets = targets.filter((t) => t.type === "ITEM_NAME");

    expect(itemNameTargets).toHaveLength(1);
    expect(itemNameTargets[0].value).toBe("ラーメン");
  });

  it("同じタグIDが重複している場合はエラーになること", () => {
    const tagId = TagId.generate();

    const result = RankingAggregate.create({ ...buildBaseParams(), rankingOrderEntityList: [], tagIdList: [tagId, TagId.of(tagId.value)] });

    expect(result.isErr()).toBe(true);
    if (result.isOk()) {
      throw new Error("unexpected ok");
    }
    expect(result.error).toEqual([{ type: "DUPLICATE_TAG", tagId: tagId.value }]);
  });

  it("異なるタグIDのみの場合はエラーにならないこと", () => {
    const result = RankingAggregate.create({ ...buildBaseParams(), rankingOrderEntityList: [], tagIdList: [TagId.generate(), TagId.generate()] });

    expect(result.isOk()).toBe(true);
  });

  it("項目とタグの両方に重複がある場合は両方のエラーを返すこと", () => {
    const items = [
      new RankingOrderEntity(RankingOrderId.generate(), new ItemName("ラーメン"), new Order(1), new ItemMemo(""), false),
      new RankingOrderEntity(RankingOrderId.generate(), new ItemName("ラーメン"), new Order(2), new ItemMemo(""), false),
    ];
    const tagId = TagId.generate();

    const result = RankingAggregate.create({ ...buildBaseParams(), rankingOrderEntityList: items, tagIdList: [tagId, tagId] });

    if (result.isOk()) {
      throw new Error("unexpected ok");
    }
    expect(result.error).toEqual([
      { type: "DUPLICATE_ITEM_NAME", itemName: "ラーメン" },
      { type: "DUPLICATE_TAG", tagId: tagId.value },
    ]);
  });
});
