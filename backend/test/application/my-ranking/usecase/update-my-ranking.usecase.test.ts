import { describe, it, expect, vi, beforeEach } from "vitest";
import { UpdateMyRankingUsecase } from "../../../../src/application/my-ranking";
import type { IContentModerationRepository, IIconValidityRepository, IRankingTitleUniquenessRepository, ITagResolutionRepository, ITagUsageRepository, IUpdateMyRankingRepository } from "../../../../src/domain/my-ranking";
import { ContentModerationDomainService, IconValidityDomainService, PublicStatus, RankingAggregate, RankingIcon, RankingMemo, RankingTagEntity, RankingTagId, RankingTitle, RankingTitleUniquenessDomainService, TagId, TagResolutionDomainService, TagUsageDomainService } from "../../../../src/domain/my-ranking";
import { RankingId, UserId } from "../../../../src/domain/shared";

const userId = UserId.of("user-1");
const rankingId = RankingId.of("ranking-1");

function buildCurrentRanking(tagIds: string[]) {
  return RankingAggregate.reconstruct({
    rankingId,
    rankingTitle: new RankingTitle("テストランキング"),
    publicStatus: new PublicStatus(1),
    icon: new RankingIcon(1),
    memo: new RankingMemo(""),
    userId,
    rankingOrderEntityList: [],
    rankingTagEntityList: tagIds.map((id) => new RankingTagEntity(RankingTagId.generate(), TagId.of(id), false)),
    isDeleted: false,
    isFavorite: false,
  });
}

function buildBody(tags: string[]) {
  return { title: "テストランキング", publicStatus: 1, icon: 1, memo: "", items: [{ itemName: "ラーメン", order: 1, memo: "" }], tags };
}

describe("UpdateMyRankingUsecase", () => {
  let repository: IUpdateMyRankingRepository;
  let moderationRepository: IContentModerationRepository;
  let tagUsageRepository: ITagUsageRepository;
  let usecase: UpdateMyRankingUsecase;

  beforeEach(() => {
    repository = { findRanking: vi.fn(), updateRanking: vi.fn() };
    const titleRepository: IRankingTitleUniquenessRepository = { findRanking: vi.fn().mockResolvedValue([]), findRankings: vi.fn() };
    moderationRepository = { detectInappropriateIndexes: vi.fn().mockResolvedValue([]) };
    const iconRepository: IIconValidityRepository = { exists: vi.fn().mockResolvedValue(true) };
    const tagResolutionRepository: ITagResolutionRepository = { findTags: vi.fn().mockResolvedValue([]) };
    tagUsageRepository = { findReferencedTagIds: vi.fn().mockResolvedValue([]) };
    usecase = new UpdateMyRankingUsecase(
      repository,
      new RankingTitleUniquenessDomainService(titleRepository),
      new ContentModerationDomainService(moderationRepository),
      new IconValidityDomainService(iconRepository),
      new TagResolutionDomainService(tagResolutionRepository),
      new TagUsageDomainService(tagUsageRepository),
    );
  });

  it("外したタグのうち未使用と判定されたタグと、新規タグをリポジトリに渡すこと", async () => {
    vi.mocked(repository.findRanking).mockResolvedValue(buildCurrentRanking(["tag-removed"]));

    const result = await usecase.execute({ userId, rankingId, body: buildBody(["新規タグ"]) });

    expect(result.isOk()).toBe(true);
    expect(tagUsageRepository.findReferencedTagIds).toHaveBeenCalledWith(userId, rankingId, [TagId.of("tag-removed")]);
    const [ranking, newTags, unusedTagIds] = vi.mocked(repository.updateRanking).mock.calls[0];
    expect(newTags.map((e) => e.name)).toEqual(["新規タグ"]);
    expect(ranking.rankingTagEntityList.map((e) => e.tagId)).toEqual(newTags.map((e) => e.id));
    expect(unusedTagIds.map((e) => e.value)).toEqual(["tag-removed"]);
  });

  it("新規タグのタグ名が不適切と判定された場合は更新しないこと", async () => {
    vi.mocked(repository.findRanking).mockResolvedValue(buildCurrentRanking([]));
    vi.mocked(moderationRepository.detectInappropriateIndexes).mockResolvedValue([2]);

    const result = await usecase.execute({ userId, rankingId, body: buildBody(["不適切なタグ"]) });

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.type).toBe("INAPPROPRIATE_CONTENT");
    }
    expect(repository.updateRanking).not.toHaveBeenCalled();
  });

  it("更新対象が存在しない場合は NOT_FOUND を返すこと", async () => {
    vi.mocked(repository.findRanking).mockResolvedValue(null);

    const result = await usecase.execute({ userId, rankingId, body: buildBody([]) });

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.type).toBe("NOT_FOUND");
    }
  });
});
