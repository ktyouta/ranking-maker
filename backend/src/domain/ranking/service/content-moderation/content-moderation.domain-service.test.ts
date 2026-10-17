import { describe, it, expect, vi, beforeEach } from "vitest";
import { ContentModerationDomainService, ContentModerationTarget, ItemMemo, ItemName, Order, PublicStatus, RankingAggregate, RankingIcon, RankingId, RankingMemo, RankingOrderEntity, RankingOrderId, RankingTitle, TagAggregate, TagName } from "../../..";
import type { IContentModerationRepository } from "../../..";
import { UserId } from "../../../shared";

describe("ContentModerationDomainService", () => {
  let mockRepository: IContentModerationRepository;
  let service: ContentModerationDomainService;

  beforeEach(() => {
    mockRepository = {
      detectInappropriateIndexes: vi.fn(),
    };
    service = new ContentModerationDomainService(mockRepository);
  });

  const userId = UserId.of("user-1");

  function buildRanking(items: RankingOrderEntity[] = []) {
    const result = RankingAggregate.create({
      rankingId: RankingId.generate(),
      rankingTitle: RankingTitle.of("テストランキング"),
      publicStatus: PublicStatus.of(1),
      icon: RankingIcon.of(1),
      memo: RankingMemo.of(""),
      userId,
      rankingOrderEntityList: items,
      rankingTagEntityList: [],
    });
    if (result.isErr()) {
      throw new Error("unexpected error");
    }
    return result.value;
  }

  it("項目名が未入力(null)の項目は判定対象に含めないこと", async () => {
    vi.mocked(mockRepository.detectInappropriateIndexes).mockResolvedValue([]);
    const items = [
      new RankingOrderEntity(RankingOrderId.generate(), ItemName.of(""), Order.of(1), ItemMemo.of(""), false),
      new RankingOrderEntity(RankingOrderId.generate(), ItemName.of("ラーメン"), Order.of(2), ItemMemo.of(""), false),
    ];

    await service.moderate(buildRanking(items), []);

    expect(mockRepository.detectInappropriateIndexes).toHaveBeenCalledWith([
      ContentModerationTarget.title("テストランキング"),
      ContentModerationTarget.itemName(1, "ラーメン"),
    ]);
  });

  it("新規タグのタグ名を判定対象に含め、不適切と判定されたタグ名を返すこと", async () => {
    vi.mocked(mockRepository.detectInappropriateIndexes).mockResolvedValue([1]);
    const newTag = TagAggregate.create({ userId, tagName: TagName.of("不適切なタグ") });

    const result = await service.moderate(buildRanking(), [newTag]);

    expect(mockRepository.detectInappropriateIndexes).toHaveBeenCalledWith([
      ContentModerationTarget.title("テストランキング"),
      ContentModerationTarget.tagName("不適切なタグ"),
    ]);
    expect(result).toEqual([ContentModerationTarget.tagName("不適切なタグ")]);
  });
});
