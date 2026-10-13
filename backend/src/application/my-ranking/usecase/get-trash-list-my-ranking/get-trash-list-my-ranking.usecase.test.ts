import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetTrashListMyRankingUsecase } from "..";
import type { IGetTrashListMyRankingRepository } from "../../../../domain/my-ranking";
import { TagName, TrashRankingSort } from "../../../../domain/my-ranking";
import { UserId } from "../../../../domain/shared";

const userId = UserId.of("user-1");

describe("GetTrashListMyRankingUsecase", () => {
  let repository: IGetTrashListMyRankingRepository;
  let usecase: GetTrashListMyRankingUsecase;

  beforeEach(() => {
    repository = { findAll: vi.fn().mockResolvedValue([]), count: vi.fn().mockResolvedValue(0) };
    usecase = new GetTrashListMyRankingUsecase(repository);
  });

  it("入力値の制約違反は項目名付きですべて返し、一覧・件数を問い合わせないこと", async () => {
    const tags = ["ラーメン", "  ", ...Array.from({ length: GetTrashListMyRankingUsecase.MAX_FILTER_TAG_COUNT }, (_, i) => `タグ${i}`)];

    const result = await usecase.execute({ userId, query: { tags, sort: "favoriteDesc", page: 1.5 } });

    expect(result._unsafeUnwrapErr()).toEqual({
      type: "INVALID_INPUT",
      errors: [
        { field: "sort", error: { type: "TRASH_RANKING_SORT_INVALID" } },
        { field: "page", error: { type: "RANKING_LIST_PAGE_INVALID", min: 1 } },
        { field: "tags.1", error: { type: "TAG_NAME_EMPTY" } },
        { field: "tags", error: { type: "TOO_MANY_FILTER_TAGS", max: GetTrashListMyRankingUsecase.MAX_FILTER_TAG_COUNT } },
      ],
    });
    expect(repository.findAll).not.toHaveBeenCalled();
    expect(repository.count).not.toHaveBeenCalled();
  });

  it("タグが上限件数ちょうどの場合は一覧を取得すること", async () => {
    const tags = Array.from({ length: GetTrashListMyRankingUsecase.MAX_FILTER_TAG_COUNT }, (_, i) => `タグ${i}`);

    const result = await usecase.execute({ userId, query: { tags } });

    expect(result.isOk()).toBe(true);
  });

  it("並び順・ページ番号を省略した場合は既定値で、タグ名は前後の空白を除いて問い合わせること", async () => {
    await usecase.execute({ userId, query: { keyword: "ラーメン", tags: [" 東京 "] } });

    const [, query, pageSize] = vi.mocked(repository.findAll).mock.calls[0];
    expect(query.keyword).toBe("ラーメン");
    expect(query.tagNames).toEqual([TagName.of("東京")]);
    expect(query.sort.value).toBe(TrashRankingSort.DEFAULT);
    expect(query.pagination.value).toBe(1);
    expect(pageSize).toBe(GetTrashListMyRankingUsecase.PAGE_SIZE);
  });

  it("全件数から総ページ数を計算すること", async () => {
    vi.mocked(repository.count).mockResolvedValue(GetTrashListMyRankingUsecase.PAGE_SIZE + 1);

    const result = await usecase.execute({ userId, query: { tags: [], sort: "createdAtAsc", page: 2 } });

    expect(result._unsafeUnwrap().value).toEqual({ list: [], total: GetTrashListMyRankingUsecase.PAGE_SIZE + 1, totalPages: 2 });
    const [, query] = vi.mocked(repository.findAll).mock.calls[0];
    expect(query.sort.value).toBe("createdAtAsc");
    expect(query.pagination.value).toBe(2);
  });
});
