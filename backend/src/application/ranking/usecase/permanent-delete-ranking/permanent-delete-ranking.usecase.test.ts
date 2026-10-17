import { describe, it, expect, vi, beforeEach } from "vitest";
import { PermanentDeleteRankingUsecase } from "..";
import type { IPermanentDeleteRankingRepository, ITagUsageRepository } from "../../../../domain/ranking";
import { PublicStatus, RankingAggregate, RankingIcon, RankingMemo, RankingTagEntity, RankingTagId, RankingTitle, TagId, TagUsageDomainService } from "../../../../domain/ranking";
import { RankingId, UserId } from "../../../../domain/shared";

const userId = UserId.of("user-1");
const rankingId = RankingId.of("ranking-1");

function buildTrashedRanking(tagIds: string[]) {
  return RankingAggregate.reconstruct({
    rankingId,
    rankingTitle: RankingTitle.of("テストランキング"),
    publicStatus: PublicStatus.of(1),
    icon: RankingIcon.of(1),
    memo: RankingMemo.of(""),
    userId,
    rankingOrderEntityList: [],
    rankingTagEntityList: tagIds.map((id) => new RankingTagEntity(RankingTagId.generate(), TagId.of(id), true)),
    isDeleted: true,
    isFavorite: false,
  });
}

describe("PermanentDeleteRankingUsecase", () => {
  let repository: IPermanentDeleteRankingRepository;
  let tagUsageRepository: ITagUsageRepository;
  let usecase: PermanentDeleteRankingUsecase;

  beforeEach(() => {
    repository = { findRanking: vi.fn(), deleteRanking: vi.fn() };
    tagUsageRepository = { findReferencedTagIds: vi.fn().mockResolvedValue([]) };
    usecase = new PermanentDeleteRankingUsecase(repository, new TagUsageDomainService(tagUsageRepository));
  });

  it("付いていたタグのうち、他のランキングに紐づいていないタグだけを削除対象として渡すこと", async () => {
    const ranking = buildTrashedRanking(["tag-only", "tag-shared"]);
    vi.mocked(repository.findRanking).mockResolvedValue(ranking);
    vi.mocked(tagUsageRepository.findReferencedTagIds).mockResolvedValue([{ tagId: "tag-shared" }]);

    const result = await usecase.execute({ userId, rankingId: rankingId.value });

    expect(result.isOk()).toBe(true);
    const [passedRanking, unusedTagIds] = vi.mocked(repository.deleteRanking).mock.calls[0];
    expect(passedRanking).toBe(ranking);
    expect(unusedTagIds.map((e) => e.value)).toEqual(["tag-only"]);
  });

  it("対象が存在しない場合は NOT_FOUND を返し、削除しないこと", async () => {
    vi.mocked(repository.findRanking).mockResolvedValue(null);

    const result = await usecase.execute({ userId, rankingId: rankingId.value });

    expect(result.isErr()).toBe(true);
    expect(repository.deleteRanking).not.toHaveBeenCalled();
  });
});
