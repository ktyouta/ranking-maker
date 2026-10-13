import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetListMyRankingUsecase } from "..";
import type { IGetListMyRankingRepository } from "../../../../domain/my-ranking";
import { RankingSort, TagName } from "../../../../domain/my-ranking";
import { UserId } from "../../../../domain/shared";

const userId = UserId.of("user-1");

describe("GetListMyRankingUsecase", () => {
  let repository: IGetListMyRankingRepository;
  let usecase: GetListMyRankingUsecase;

  beforeEach(() => {
    repository = { findAll: vi.fn().mockResolvedValue([]), count: vi.fn().mockResolvedValue(0) };
    usecase = new GetListMyRankingUsecase(repository);
  });

  it("入力値の制約違反は項目名付きですべて返し、一覧・件数を問い合わせないこと", async () => {
    const tags = ["ラーメン", "  ", ...Array.from({ length: GetListMyRankingUsecase.MAX_FILTER_TAG_COUNT }, (_, i) => `タグ${i}`)];

    const result = await usecase.execute({ userId, query: { favoriteOnly: false, tags, sort: "nameAsc", page: 0 } });

    expect(result._unsafeUnwrapErr()).toEqual({
      type: "INVALID_INPUT",
      errors: [
        { field: "sort", error: { type: "RANKING_SORT_INVALID" } },
        { field: "page", error: { type: "RANKING_LIST_PAGE_INVALID", min: 1 } },
        { field: "tags.1", error: { type: "TAG_NAME_EMPTY" } },
        { field: "tags", error: { type: "TOO_MANY_FILTER_TAGS", max: GetListMyRankingUsecase.MAX_FILTER_TAG_COUNT } },
      ],
    });
    expect(repository.findAll).not.toHaveBeenCalled();
    expect(repository.count).not.toHaveBeenCalled();
  });

  it("タグが上限件数ちょうどの場合は一覧を取得すること", async () => {
    const tags = Array.from({ length: GetListMyRankingUsecase.MAX_FILTER_TAG_COUNT }, (_, i) => `タグ${i}`);

    const result = await usecase.execute({ userId, query: { favoriteOnly: false, tags } });

    expect(result.isOk()).toBe(true);
  });

  it("並び順・ページ番号を省略した場合は既定値で、タグ名は前後の空白を除いて問い合わせること", async () => {
    await usecase.execute({ userId, query: { keyword: "ラーメン", favoriteOnly: true, tags: [" 東京 "] } });

    const [, query, pageSize] = vi.mocked(repository.findAll).mock.calls[0];
    expect(query.keyword).toBe("ラーメン");
    expect(query.favoriteOnly).toBe(true);
    expect(query.tagNames).toEqual([TagName.of("東京")]);
    expect(query.sort.value).toBe(RankingSort.DEFAULT);
    expect(query.pagination.value).toBe(1);
    expect(pageSize).toBe(GetListMyRankingUsecase.PAGE_SIZE);
  });

  it("全件数から総ページ数を計算すること", async () => {
    vi.mocked(repository.count).mockResolvedValue(GetListMyRankingUsecase.PAGE_SIZE + 1);

    const result = await usecase.execute({ userId, query: { favoriteOnly: false, tags: [], sort: "createdAtAsc", page: 2 } });

    expect(result._unsafeUnwrap().value).toEqual({ list: [], total: GetListMyRankingUsecase.PAGE_SIZE + 1, totalPages: 2 });
    const [, query] = vi.mocked(repository.findAll).mock.calls[0];
    expect(query.sort.value).toBe("createdAtAsc");
    expect(query.pagination.value).toBe(2);
  });
});
