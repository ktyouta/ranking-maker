import { describe, it, expect, vi, beforeEach } from "vitest";
import { ContentModerationDomainService, ContentModerationTarget, ItemMemo, ItemName, Order, PublicStatus, RankingAggregate, RankingIcon, RankingId, RankingMemo, RankingOrderEntity, RankingOrderId, RankingTitle, TagAggregate, TagName } from "../../src/domain";
import type { IContentModerationRepository } from "../../src/domain";
import { UserId } from "../../src/domain/shared";

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
      rankingTitle: new RankingTitle("テストランキング"),
      publicStatus: new PublicStatus(1),
      icon: new RankingIcon(1),
      memo: new RankingMemo(""),
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
      new RankingOrderEntity(RankingOrderId.generate(), new ItemName(""), new Order(1), new ItemMemo(""), false),
      new RankingOrderEntity(RankingOrderId.generate(), new ItemName("ラーメン"), new Order(2), new ItemMemo(""), false),
    ];

    await service.moderate(buildRanking(items), []);

    expect(mockRepository.detectInappropriateIndexes).toHaveBeenCalledWith([
      ContentModerationTarget.title("テストランキング"),
      ContentModerationTarget.itemName(1, "ラーメン"),
    ]);
  });

  it("新規タグのタグ名を判定対象に含め、不適切と判定されたタグ名を返すこと", async () => {
    vi.mocked(mockRepository.detectInappropriateIndexes).mockResolvedValue([1]);
    const newTag = TagAggregate.create({ userId, tagName: new TagName("不適切なタグ") });

    const result = await service.moderate(buildRanking(), [newTag]);

    expect(mockRepository.detectInappropriateIndexes).toHaveBeenCalledWith([
      ContentModerationTarget.title("テストランキング"),
      ContentModerationTarget.tagName("不適切なタグ"),
    ]);
    expect(result).toEqual([ContentModerationTarget.tagName("不適切なタグ")]);
  });
});
