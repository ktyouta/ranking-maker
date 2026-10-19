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
} from "../../..";
import { UserId } from "../../../shared";

function buildBaseParams() {
  return {
    rankingId: RankingId.create(),
    rankingTitle: RankingTitle.of("テストランキング"),
    publicStatus: PublicStatus.of(1),
    icon: RankingIcon.of(1),
    memo: RankingMemo.of(""),
    userId: UserId.create(),
    rankingTagEntityList: [] as RankingTagEntity[],
  };
}

function buildRankingTag(tagId: TagId) {
  return new RankingTagEntity(RankingTagId.create(), tagId, false);
}

describe("RankingAggregate", () => {
  it("項目名が未入力(null)の項目が複数あっても重複エラーにならないこと", () => {
    const items = [
      new RankingOrderEntity(RankingOrderId.create(), ItemName.of(""), Order.of(1), ItemMemo.of(""), false),
      new RankingOrderEntity(RankingOrderId.create(), ItemName.of(""), Order.of(2), ItemMemo.of(""), false),
      new RankingOrderEntity(RankingOrderId.create(), ItemName.of(""), Order.of(3), ItemMemo.of(""), false),
    ];

    const result = RankingAggregate.create({ ...buildBaseParams(), rankingOrderEntityList: items });

    expect(result.isOk()).toBe(true);
  });

  it("項目名が入力されていて重複している場合はエラーになること", () => {
    const items = [
      new RankingOrderEntity(RankingOrderId.create(), ItemName.of("ラーメン"), Order.of(1), ItemMemo.of(""), false),
      new RankingOrderEntity(RankingOrderId.create(), ItemName.of("ラーメン"), Order.of(2), ItemMemo.of(""), false),
    ];

    const result = RankingAggregate.create({ ...buildBaseParams(), rankingOrderEntityList: items });

    expect(result.isErr()).toBe(true);
  });

  it("同じタグが重複して付けられている場合はエラーになること", () => {
    const tagId = TagId.create();

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
      rankingTagEntityList: Array.from({ length: RankingAggregate.MAX_TAG_COUNT }, () => buildRankingTag(TagId.create())),
    });

    expect(result.isOk()).toBe(true);
  });

  it("タグが上限件数を超える場合はエラーになること", () => {
    const result = RankingAggregate.create({
      ...buildBaseParams(),
      rankingOrderEntityList: [],
      rankingTagEntityList: Array.from({ length: RankingAggregate.MAX_TAG_COUNT + 1 }, () => buildRankingTag(TagId.create())),
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
      rankingTagEntityList: [buildRankingTag(TagId.create()), buildRankingTag(TagId.create())],
    });

    expect(result.isOk()).toBe(true);
  });

  it("update: 識別子・所有者・お気に入り状態を引き継ぎ、外したタグを手放したタグとして返すこと", () => {
    const keptTagId = TagId.create();
    const removedTagId = TagId.create();
    const addedTagId = TagId.create();
    const base = buildBaseParams();
    const current = RankingAggregate.reconstruct({
      ...base,
      rankingOrderEntityList: [],
      rankingTagEntityList: [buildRankingTag(keptTagId), buildRankingTag(removedTagId)],
      isDeleted: false,
      isFavorite: true,
    });

    const result = current.update({
      rankingTitle: RankingTitle.of("更新後のタイトル"),
      publicStatus: PublicStatus.of(1),
      icon: RankingIcon.of(1),
      memo: RankingMemo.of(""),
      rankingOrderEntityList: [],
      rankingTagEntityList: [buildRankingTag(TagId.of(keptTagId.value)), buildRankingTag(addedTagId)],
    });
    if (result.isErr()) {
      throw new Error("unexpected error");
    }

    const releasedTagIds = result.value;
    expect(current.id).toBe(base.rankingId.value);
    expect(current.userId).toBe(base.userId.value);
    expect(current.isFavorite()).toBe(true);
    expect(current.title).toBe("更新後のタイトル");
    expect(current.toSnapshot().rankingTagList.map((e) => e.tagId)).toEqual([keptTagId.value, addedTagId.value]);
    expect(releasedTagIds.map((e) => e.value)).toEqual([removedTagId.value]);
  });

  it("update: 重複がある場合は違反一覧を返し、集約を変更しないこと", () => {
    const tagId = TagId.create();
    const current = RankingAggregate.reconstruct({
      ...buildBaseParams(),
      rankingOrderEntityList: [],
      isDeleted: false,
      isFavorite: false,
    });
    const before = current.toSnapshot();

    const result = current.update({
      rankingTitle: RankingTitle.of("更新後のタイトル"),
      publicStatus: PublicStatus.of(1),
      icon: RankingIcon.of(1),
      memo: RankingMemo.of(""),
      rankingOrderEntityList: [],
      rankingTagEntityList: [buildRankingTag(tagId), buildRankingTag(TagId.of(tagId.value))],
    });

    if (result.isOk()) {
      throw new Error("unexpected ok");
    }
    expect(result.error).toEqual([{ type: "DUPLICATE_TAG", tagId: tagId.value }]);
    expect(current.toSnapshot()).toEqual(before);
  });

  it("update: 削除済みのランキングはエラーになること", () => {
    const current = RankingAggregate.reconstruct({
      ...buildBaseParams(),
      rankingOrderEntityList: [],
      isDeleted: true,
      isFavorite: false,
    });

    expect(() => current.update({
      rankingTitle: RankingTitle.of("テストランキング"),
      publicStatus: PublicStatus.of(1),
      icon: RankingIcon.of(1),
      memo: RankingMemo.of(""),
      rankingOrderEntityList: [],
      rankingTagEntityList: [],
    })).toThrow();
  });

  it("releaseTagsOnPermanentDelete: 削除済みのランキングは付いていたタグをすべて手放すこと", () => {
    const tagIds = [TagId.create(), TagId.create()];
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
      rankingTagEntityList: [buildRankingTag(TagId.create())],
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
      rankingTagEntityList: [new RankingTagEntity(RankingTagId.create(), TagId.create(), true)],
      isDeleted: true,
      isFavorite: false,
    });

    ranking.restore();

    expect(ranking.toSnapshot().rankingTagList.every((e) => !e.deleteFlg)).toBe(true);
  });

  it.each([true, false])("changeFavorite: お気に入り状態を %s に変更すること", (isFavorite) => {
    const ranking = RankingAggregate.reconstruct({
      ...buildBaseParams(),
      rankingOrderEntityList: [],
      isDeleted: false,
      isFavorite: !isFavorite,
    });

    ranking.changeFavorite(isFavorite);

    expect(ranking.isFavorite()).toBe(isFavorite);
  });

  it("changeFavorite: 削除済みのランキングはエラーになること", () => {
    const ranking = RankingAggregate.reconstruct({
      ...buildBaseParams(),
      rankingOrderEntityList: [],
      isDeleted: true,
      isFavorite: false,
    });

    expect(() => ranking.changeFavorite(true)).toThrow();
  });

  it("項目とタグの両方に重複がある場合は両方のエラーを返すこと", () => {
    const items = [
      new RankingOrderEntity(RankingOrderId.create(), ItemName.of("ラーメン"), Order.of(1), ItemMemo.of(""), false),
      new RankingOrderEntity(RankingOrderId.create(), ItemName.of("ラーメン"), Order.of(2), ItemMemo.of(""), false),
    ];
    const tagId = TagId.create();

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
