import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateMyRankingUsecase } from "../../../../src/application/my-ranking";
import type { IContentModerationRepository, ICreateMyRankingRepository, IIconValidityRepository, IRankingTitleUniquenessRepository, ITagResolutionRepository } from "../../../../src/domain/my-ranking";
import { ContentModerationDomainService, IconValidityDomainService, RankingTitleUniquenessDomainService, TagAggregate, TagId, TagName, TagResolutionDomainService } from "../../../../src/domain/my-ranking";
import { UserId } from "../../../../src/domain/shared";

const userId = UserId.of("user-1");

function buildBody(tags: string[]) {
  return { title: "テストランキング", publicStatus: 1, icon: 1, memo: "", items: [{ itemName: "ラーメン", order: 1, memo: "" }], tags };
}

describe("CreateMyRankingUsecase", () => {
  let repository: ICreateMyRankingRepository;
  let moderationRepository: IContentModerationRepository;
  let tagResolutionRepository: ITagResolutionRepository;
  let usecase: CreateMyRankingUsecase;

  beforeEach(() => {
    repository = { createRanking: vi.fn() };
    const titleRepository: IRankingTitleUniquenessRepository = { findRanking: vi.fn().mockResolvedValue([]), findRankings: vi.fn() };
    moderationRepository = { detectInappropriateIndexes: vi.fn().mockResolvedValue([]) };
    const iconRepository: IIconValidityRepository = { exists: vi.fn().mockResolvedValue(true) };
    tagResolutionRepository = { findTags: vi.fn().mockResolvedValue([]) };
    usecase = new CreateMyRankingUsecase(
      repository,
      new RankingTitleUniquenessDomainService(titleRepository),
      new ContentModerationDomainService(moderationRepository),
      new IconValidityDomainService(iconRepository),
      new TagResolutionDomainService(tagResolutionRepository),
    );
  });

  it("既存タグは再利用し、新規タグだけをリポジトリに渡すこと", async () => {
    const existingTag = TagAggregate.reconstruct({ tagId: TagId.of("tag-existing"), userId, tagName: new TagName("ラーメン") });
    vi.mocked(tagResolutionRepository.findTags).mockResolvedValue([existingTag]);

    const result = await usecase.execute({ userId, body: buildBody(["ラーメン", "寿司"]) });

    expect(result.isOk()).toBe(true);
    const [ranking, newTags] = vi.mocked(repository.createRanking).mock.calls[0];
    expect(newTags.map((e) => e.name)).toEqual(["寿司"]);
    expect(ranking.rankingTagEntityList.map((e) => e.tagId)).toEqual(["tag-existing", newTags[0].id]);
  });

  it("新規タグのタグ名が不適切と判定された場合は作成しないこと", async () => {
    vi.mocked(moderationRepository.detectInappropriateIndexes).mockResolvedValue([2]);

    const result = await usecase.execute({ userId, body: buildBody(["不適切なタグ"]) });

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.type).toBe("INAPPROPRIATE_CONTENT");
    }
    expect(repository.createRanking).not.toHaveBeenCalled();
  });
});
