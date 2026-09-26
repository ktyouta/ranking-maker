import { describe, it, expect, vi, beforeEach } from "vitest";
import { TagId, TagUsageDomainService } from "../../src/domain";
import type { ITagUsageRepository } from "../../src/domain";
import { RankingId, UserId } from "../../src/domain/shared";

describe("TagUsageDomainService", () => {
  let mockRepository: ITagUsageRepository;
  let service: TagUsageDomainService;

  beforeEach(() => {
    mockRepository = {
      findReferencedTagIds: vi.fn(),
    };
    service = new TagUsageDomainService(mockRepository);
  });

  const userId = UserId.of("user-1");
  const rankingId = RankingId.of("ranking-1");

  it("他のランキングに紐づいていないタグだけを未使用として返すこと", async () => {
    vi.mocked(mockRepository.findReferencedTagIds).mockResolvedValue([{ tagId: "tag-used" }]);

    const result = await service.findUnused({
      userId,
      rankingId,
      releasedTagIds: [TagId.of("tag-used"), TagId.of("tag-unused")],
    });

    expect(result.map((e) => e.value)).toEqual(["tag-unused"]);
  });

  it("すべて他のランキングに紐づいている場合は空を返すこと", async () => {
    vi.mocked(mockRepository.findReferencedTagIds).mockResolvedValue([{ tagId: "tag-1" }, { tagId: "tag-2" }]);

    const result = await service.findUnused({
      userId,
      rankingId,
      releasedTagIds: [TagId.of("tag-1"), TagId.of("tag-2")],
    });

    expect(result).toEqual([]);
  });

  it("手放したタグがない場合、リポジトリを呼ばずに空を返すこと", async () => {
    const result = await service.findUnused({ userId, rankingId, releasedTagIds: [] });

    expect(result).toEqual([]);
    expect(mockRepository.findReferencedTagIds).not.toHaveBeenCalled();
  });
});
