import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateRankingUsecase } from "..";
import type { IContentModerationRepository, ICreateRankingRepository, IIconValidityRepository, IRankingTitleUniquenessRepository, ITagResolutionRepository } from "../../../../domain/ranking";
import { ContentModerationDomainService, IconValidityDomainService, RankingTitleUniquenessDomainService, TagAggregate, TagId, TagName, TagResolutionDomainService } from "../../../../domain/ranking";
import { UserId } from "../../../../domain/shared";

const userId = UserId.of("user-1");

function buildBody(tags: string[]) {
  return { title: "テストランキング", publicStatus: 1, icon: 1, memo: "", items: [{ itemName: "ラーメン", order: 1, memo: "" }], tags };
}

describe("CreateRankingUsecase", () => {
  let repository: ICreateRankingRepository;
  let moderationRepository: IContentModerationRepository;
  let tagResolutionRepository: ITagResolutionRepository;
  let usecase: CreateRankingUsecase;

  beforeEach(() => {
    repository = { createRanking: vi.fn() };
    const titleRepository: IRankingTitleUniquenessRepository = { findRanking: vi.fn().mockResolvedValue([]), findRankings: vi.fn() };
    moderationRepository = { detectInappropriateIndexes: vi.fn().mockResolvedValue([]) };
    const iconRepository: IIconValidityRepository = { exists: vi.fn().mockResolvedValue(true) };
    tagResolutionRepository = { findTags: vi.fn().mockResolvedValue([]) };
    usecase = new CreateRankingUsecase(
      repository,
      new RankingTitleUniquenessDomainService(titleRepository),
      new ContentModerationDomainService(moderationRepository),
      new IconValidityDomainService(iconRepository),
      new TagResolutionDomainService(tagResolutionRepository),
    );
  });

  it("入力値の制約違反は項目名付きですべて返し、DB を問い合わせず保存しないこと", async () => {
    const body = {
      ...buildBody(["ラーメン", "  "]),
      title: "   ",
      publicStatus: 99,
      items: [{ itemName: "ラーメン", order: 1, memo: "" }, { itemName: "あ".repeat(101), order: 0, memo: "" }],
    };

    const result = await usecase.execute({ userId, body });

    expect(result._unsafeUnwrapErr()).toEqual({
      type: "INVALID_INPUT",
      errors: [
        { field: "title", error: { type: "RANKING_TITLE_EMPTY" } },
        { field: "publicStatus", error: { type: "PUBLIC_STATUS_INVALID" } },
        { field: "items.1.itemName", error: { type: "ITEM_NAME_TOO_LONG", max: 100 } },
        { field: "items.1.order", error: { type: "ORDER_INVALID", min: 1 } },
        { field: "tags.1", error: { type: "TAG_NAME_EMPTY" } },
      ],
    });
    expect(tagResolutionRepository.findTags).not.toHaveBeenCalled();
    expect(repository.createRanking).not.toHaveBeenCalled();
  });

  it("同じタグ名が複数指定された場合は、集約の DUPLICATE_TAG として返し保存しないこと", async () => {
    const result = await usecase.execute({ userId, body: buildBody(["ラーメン", " ラーメン "]) });

    const error = result._unsafeUnwrapErr();
    expect(error.type).toBe("VALIDATION");
    if (error.type === "VALIDATION") {
      expect(error.errors.map((e) => e.type)).toEqual(["DUPLICATE_TAG"]);
    }
    expect(repository.createRanking).not.toHaveBeenCalled();
  });

  it("既存タグは再利用し、新規タグだけをリポジトリに渡すこと", async () => {
    const existingTag = TagAggregate.reconstruct({ tagId: TagId.of("tag-existing"), userId, tagName: TagName.of("ラーメン") });
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
