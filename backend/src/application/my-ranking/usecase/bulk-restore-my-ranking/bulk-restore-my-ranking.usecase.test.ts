import { describe, it, expect, vi, beforeEach } from "vitest";
import { BulkRestoreMyRankingUsecase } from "..";
import type { IBulkRestoreMyRankingRepository, IRankingTitleUniquenessRepository } from "../../../../domain/my-ranking";
import { RankingTitleUniquenessDomainService } from "../../../../domain/my-ranking";
import { UserId } from "../../../../domain/shared";

const userId = UserId.of("user-1");

describe("BulkRestoreMyRankingUsecase", () => {
  let repository: IBulkRestoreMyRankingRepository;
  let titleRepository: IRankingTitleUniquenessRepository;
  let usecase: BulkRestoreMyRankingUsecase;

  beforeEach(() => {
    repository = { findRankings: vi.fn().mockResolvedValue([]), restoreRankings: vi.fn() };
    titleRepository = { findRanking: vi.fn(), findRankings: vi.fn().mockResolvedValue([]) };
    usecase = new BulkRestoreMyRankingUsecase(repository, new RankingTitleUniquenessDomainService(titleRepository));
  });

  it("空のIDと件数超過の違反は項目名付きですべて返し、DB を問い合わせないこと", async () => {
    const ids = ["ranking-1", "", ...Array.from({ length: BulkRestoreMyRankingUsecase.MAX_RANKING_ID_COUNT }, (_, i) => `ranking-${i + 2}`)];

    const result = await usecase.execute({ userId, rankingIds: ids });

    expect(result._unsafeUnwrapErr()).toEqual({
      type: "INVALID_INPUT",
      errors: [
        { field: "ids.1", error: { type: "RANKING_ID_EMPTY" } },
        { field: "ids", error: { type: "TOO_MANY_RANKING_IDS", max: BulkRestoreMyRankingUsecase.MAX_RANKING_ID_COUNT } },
      ],
    });
    expect(repository.findRankings).not.toHaveBeenCalled();
    expect(repository.restoreRankings).not.toHaveBeenCalled();
  });

  it("IDが0件の場合は EMPTY_RANKING_IDS を返すこと", async () => {
    const result = await usecase.execute({ userId, rankingIds: [] });

    expect(result._unsafeUnwrapErr()).toEqual({ type: "INVALID_INPUT", errors: [{ field: "ids", error: { type: "EMPTY_RANKING_IDS" } }] });
    expect(repository.findRankings).not.toHaveBeenCalled();
  });

  it("IDが上限件数ちょうどの場合は所有権フィルタに進むこと", async () => {
    const ids = Array.from({ length: BulkRestoreMyRankingUsecase.MAX_RANKING_ID_COUNT }, (_, i) => `ranking-${i}`);

    const result = await usecase.execute({ userId, rankingIds: ids });

    expect(result._unsafeUnwrap().value).toEqual({ restoreCount: 0, skippedCount: 0 });
    const [, passedIds] = vi.mocked(repository.findRankings).mock.calls[0];
    expect(passedIds.map((id) => id.value)).toEqual(ids);
  });
});
