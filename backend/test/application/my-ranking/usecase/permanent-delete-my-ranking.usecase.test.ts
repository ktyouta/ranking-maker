import { describe, it, expect, vi, beforeEach } from "vitest";
import { PermanentDeleteMyRankingUsecase } from "../../../../src/application/my-ranking";
import type { IPermanentDeleteMyRankingRepository, ITagUsageRepository } from "../../../../src/domain/my-ranking";
import { PublicStatus, RankingAggregate, RankingIcon, RankingMemo, RankingTagEntity, RankingTagId, RankingTitle, TagId, TagUsageDomainService } from "../../../../src/domain/my-ranking";
import { RankingId, UserId } from "../../../../src/domain/shared";

const userId = UserId.of("user-1");
const rankingId = RankingId.of("ranking-1");

function buildTrashedRanking(tagIds: string[]) {
  return RankingAggregate.reconstruct({
    rankingId,
    rankingTitle: new RankingTitle("テストランキング"),
    publicStatus: new PublicStatus(1),
    icon: new RankingIcon(1),
    memo: new RankingMemo(""),
    userId,
    rankingOrderEntityList: [],
    rankingTagEntityList: tagIds.map((id) => new RankingTagEntity(RankingTagId.generate(), TagId.of(id), true)),
    isDeleted: true,
    isFavorite: false,
  });
}

describe("PermanentDeleteMyRankingUsecase", () => {
  let repository: IPermanentDeleteMyRankingRepository;
  let tagUsageRepository: ITagUsageRepository;
  let usecase: PermanentDeleteMyRankingUsecase;

  beforeEach(() => {
    repository = { findRanking: vi.fn(), deleteRanking: vi.fn() };
    tagUsageRepository = { findReferencedTagIds: vi.fn().mockResolvedValue([]) };
    usecase = new PermanentDeleteMyRankingUsecase(repository, new TagUsageDomainService(tagUsageRepository));
  });

  it("付いていたタグのうち、他のランキングに紐づいていないタグだけを削除対象として渡すこと", async () => {
    const ranking = buildTrashedRanking(["tag-only", "tag-shared"]);
    vi.mocked(repository.findRanking).mockResolvedValue(ranking);
    vi.mocked(tagUsageRepository.findReferencedTagIds).mockResolvedValue([{ tagId: "tag-shared" }]);

    const result = await usecase.execute(userId, rankingId);

    expect(result.isOk()).toBe(true);
    const [passedRanking, unusedTagIds] = vi.mocked(repository.deleteRanking).mock.calls[0];
    expect(passedRanking).toBe(ranking);
    expect(unusedTagIds.map((e) => e.value)).toEqual(["tag-only"]);
  });

  it("対象が存在しない場合は NOT_FOUND を返し、削除しないこと", async () => {
    vi.mocked(repository.findRanking).mockResolvedValue(null);

    const result = await usecase.execute(userId, rankingId);

    expect(result.isErr()).toBe(true);
    expect(repository.deleteRanking).not.toHaveBeenCalled();
  });
});
