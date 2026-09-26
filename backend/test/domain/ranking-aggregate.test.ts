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
  RankingTagEntity,
  RankingTagId,
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
    rankingTagEntityList: [] as RankingTagEntity[],
  };
}

function buildRankingTag(tagId: TagId) {
  return new RankingTagEntity(RankingTagId.generate(), tagId, false);
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

  it("同じタグが重複して付けられている場合はエラーになること", () => {
    const tagId = TagId.generate();

    const result = RankingAggregate.create({
      ...buildBaseParams(),
      rankingOrderEntityList: [],
      rankingTagEntityList: [buildRankingTag(tagId), buildRankingTag(TagId.of(tagId.value))],
    });

    if (result.isOk()) {
      throw new Error("unexpected ok");
    }
    expect(result.error).toEqual([{ type: "DUPLICATE_TAG", tagId: tagId.value }]);
  });

  it("タグが上限件数ちょうどの場合はエラーにならないこと", () => {
    const result = RankingAggregate.create({
      ...buildBaseParams(),
      rankingOrderEntityList: [],
      rankingTagEntityList: Array.from({ length: RankingAggregate.MAX_TAG_COUNT }, () => buildRankingTag(TagId.generate())),
    });

    expect(result.isOk()).toBe(true);
  });

  it("タグが上限件数を超える場合はエラーになること", () => {
    const result = RankingAggregate.create({
      ...buildBaseParams(),
      rankingOrderEntityList: [],
      rankingTagEntityList: Array.from({ length: RankingAggregate.MAX_TAG_COUNT + 1 }, () => buildRankingTag(TagId.generate())),
    });

    if (result.isOk()) {
      throw new Error("unexpected ok");
    }
    expect(result.error).toEqual([{ type: "TOO_MANY_TAGS", maxCount: RankingAggregate.MAX_TAG_COUNT }]);
  });

  it("異なるタグのみの場合はエラーにならないこと", () => {
    const result = RankingAggregate.create({
      ...buildBaseParams(),
      rankingOrderEntityList: [],
      rankingTagEntityList: [buildRankingTag(TagId.generate()), buildRankingTag(TagId.generate())],
    });

    expect(result.isOk()).toBe(true);
  });

  it("update: 識別子・所有者・お気に入り状態を引き継ぎ、外したタグを手放したタグとして返すこと", () => {
    const keptTagId = TagId.generate();
    const removedTagId = TagId.generate();
    const addedTagId = TagId.generate();
    const base = buildBaseParams();
    const current = RankingAggregate.reconstruct({
      ...base,
      rankingOrderEntityList: [],
      rankingTagEntityList: [buildRankingTag(keptTagId), buildRankingTag(removedTagId)],
      isDeleted: false,
      isFavorite: true,
    });

    const result = current.update({
      rankingTitle: new RankingTitle("更新後のタイトル"),
      publicStatus: new PublicStatus(1),
      icon: new RankingIcon(1),
      memo: new RankingMemo(""),
      rankingOrderEntityList: [],
      rankingTagEntityList: [buildRankingTag(TagId.of(keptTagId.value)), buildRankingTag(addedTagId)],
    });
    if (result.isErr()) {
      throw new Error("unexpected error");
    }

    const { ranking, releasedTagIds } = result.value;
    expect(ranking.id).toBe(base.rankingId.value);
    expect(ranking.userId).toBe(base.userId.value);
    expect(ranking.isFavorite()).toBe(true);
    expect(ranking.title).toBe("更新後のタイトル");
    expect(ranking.rankingTagEntityList.map((e) => e.tagId)).toEqual([keptTagId.value, addedTagId.value]);
    expect(releasedTagIds.map((e) => e.value)).toEqual([removedTagId.value]);
  });

  it("update: 重複がある場合は違反一覧を返すこと", () => {
    const tagId = TagId.generate();
    const current = RankingAggregate.reconstruct({
      ...buildBaseParams(),
      rankingOrderEntityList: [],
      isDeleted: false,
      isFavorite: false,
    });

    const result = current.update({
      rankingTitle: new RankingTitle("テストランキング"),
      publicStatus: new PublicStatus(1),
      icon: new RankingIcon(1),
      memo: new RankingMemo(""),
      rankingOrderEntityList: [],
      rankingTagEntityList: [buildRankingTag(tagId), buildRankingTag(TagId.of(tagId.value))],
    });

    if (result.isOk()) {
      throw new Error("unexpected ok");
    }
    expect(result.error).toEqual([{ type: "DUPLICATE_TAG", tagId: tagId.value }]);
  });

  it("update: 削除済みのランキングはエラーになること", () => {
    const current = RankingAggregate.reconstruct({
      ...buildBaseParams(),
      rankingOrderEntityList: [],
      isDeleted: true,
      isFavorite: false,
    });

    expect(() => current.update({
      rankingTitle: new RankingTitle("テストランキング"),
      publicStatus: new PublicStatus(1),
      icon: new RankingIcon(1),
      memo: new RankingMemo(""),
      rankingOrderEntityList: [],
      rankingTagEntityList: [],
    })).toThrow();
  });

  it("releaseTagsOnPermanentDelete: 削除済みのランキングは付いていたタグをすべて手放すこと", () => {
    const tagIds = [TagId.generate(), TagId.generate()];
    const ranking = RankingAggregate.reconstruct({
      ...buildBaseParams(),
      rankingOrderEntityList: [],
      rankingTagEntityList: tagIds.map(buildRankingTag),
      isDeleted: true,
      isFavorite: false,
    });

    expect(ranking.releaseTagsOnPermanentDelete().map((e) => e.value)).toEqual(tagIds.map((e) => e.value));
  });

  it("releaseTagsOnPermanentDelete: 削除されていないランキングはエラーになること", () => {
    const ranking = RankingAggregate.reconstruct({
      ...buildBaseParams(),
      rankingOrderEntityList: [],
      isDeleted: false,
      isFavorite: false,
    });

    expect(() => ranking.releaseTagsOnPermanentDelete()).toThrow();
  });

  it("delete: 配下のタグ付けも削除状態にすること", () => {
    const ranking = RankingAggregate.reconstruct({
      ...buildBaseParams(),
      rankingOrderEntityList: [],
      rankingTagEntityList: [buildRankingTag(TagId.generate())],
      isDeleted: false,
      isFavorite: false,
    });

    ranking.delete();

    expect(ranking.toSnapshot().rankingTagList.every((e) => e.deleteFlg)).toBe(true);
  });

  it("restore: 配下のタグ付けも復元すること", () => {
    const ranking = RankingAggregate.reconstruct({
      ...buildBaseParams(),
      rankingOrderEntityList: [],
      rankingTagEntityList: [new RankingTagEntity(RankingTagId.generate(), TagId.generate(), true)],
      isDeleted: true,
      isFavorite: false,
    });

    ranking.restore();

    expect(ranking.toSnapshot().rankingTagList.every((e) => !e.deleteFlg)).toBe(true);
  });

  it("項目とタグの両方に重複がある場合は両方のエラーを返すこと", () => {
    const items = [
      new RankingOrderEntity(RankingOrderId.generate(), new ItemName("ラーメン"), new Order(1), new ItemMemo(""), false),
      new RankingOrderEntity(RankingOrderId.generate(), new ItemName("ラーメン"), new Order(2), new ItemMemo(""), false),
    ];
    const tagId = TagId.generate();

    const result = RankingAggregate.create({
      ...buildBaseParams(),
      rankingOrderEntityList: items,
      rankingTagEntityList: [buildRankingTag(tagId), buildRankingTag(tagId)],
    });

    if (result.isOk()) {
      throw new Error("unexpected ok");
    }
    expect(result.error).toEqual([
      { type: "DUPLICATE_ITEM_NAME", itemName: "ラーメン" },
      { type: "DUPLICATE_TAG", tagId: tagId.value },
    ]);
  });
});
