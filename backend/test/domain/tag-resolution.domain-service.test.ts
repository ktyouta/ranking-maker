import { describe, it, expect, vi, beforeEach } from "vitest";
import { TagAggregate, TagId, TagName, TagResolutionDomainService } from "../../src/domain";
import type { ITagResolutionRepository } from "../../src/domain";
import { UserId } from "../../src/domain/shared";

function buildExistingTag(id: string, name: string) {
  return TagAggregate.reconstruct({ tagId: TagId.of(id), userId: UserId.of("user-1"), tagName: new TagName(name) });
}

describe("TagResolutionDomainService", () => {
  let mockRepository: ITagResolutionRepository;
  let service: TagResolutionDomainService;

  beforeEach(() => {
    mockRepository = {
      findTags: vi.fn(),
    };
    service = new TagResolutionDomainService(mockRepository);
  });

  const userId = UserId.of("user-1");

  it("既存タグと同名のタグ名は既存タグに解決し、新規タグに含めないこと", async () => {
    vi.mocked(mockRepository.findTags).mockResolvedValue([buildExistingTag("tag-1", "ラーメン")]);

    const result = await service.resolve({ userId, tagNames: [new TagName("ラーメン")] });

    expect(result.tags.map((e) => e.id)).toEqual(["tag-1"]);
    expect(result.newTags).toHaveLength(0);
  });

  it("既存タグにないタグ名は新規タグとして作成すること", async () => {
    vi.mocked(mockRepository.findTags).mockResolvedValue([]);

    const result = await service.resolve({ userId, tagNames: [new TagName("寿司")] });

    expect(result.tags).toHaveLength(1);
    expect(result.newTags).toEqual(result.tags);
    expect(result.newTags[0].name).toBe("寿司");
    expect(result.newTags[0].userId).toBe("user-1");
  });

  it("既存タグと新規タグが混在する場合、指定順に解決すること", async () => {
    vi.mocked(mockRepository.findTags).mockResolvedValue([buildExistingTag("tag-1", "ラーメン")]);

    const result = await service.resolve({ userId, tagNames: [new TagName("寿司"), new TagName("ラーメン")] });

    expect(result.tags.map((e) => e.name)).toEqual(["寿司", "ラーメン"]);
    expect(result.tags[1].id).toBe("tag-1");
    expect(result.newTags.map((e) => e.name)).toEqual(["寿司"]);
  });

  it("同じ新規タグ名が複数指定された場合、同じタグに解決し新規タグは1件になること", async () => {
    vi.mocked(mockRepository.findTags).mockResolvedValue([]);

    const result = await service.resolve({ userId, tagNames: [new TagName("寿司"), new TagName("寿司")] });

    expect(result.tags[0].id).toBe(result.tags[1].id);
    expect(result.newTags).toHaveLength(1);
  });

  it("タグ名が空の場合、リポジトリを呼ばずに空の結果を返すこと", async () => {
    const result = await service.resolve({ userId, tagNames: [] });

    expect(result).toEqual({ tags: [], newTags: [] });
    expect(mockRepository.findTags).not.toHaveBeenCalled();
  });
});
