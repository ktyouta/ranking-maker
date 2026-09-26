import { describe, it, expect, vi, beforeEach } from "vitest";
import { BulkSoftDeleteMyRankingUsecase } from "../../../../src/application/my-ranking";
import type { IBulkSoftDeleteMyRankingRepository } from "../../../../src/domain/my-ranking";
import { PublicStatus, RankingAggregate, RankingIcon, RankingMemo, RankingTitle } from "../../../../src/domain/my-ranking";
import { RankingId, UserId } from "../../../../src/domain/shared";

function buildRanking(id: string, isFavorite: boolean) {
  return RankingAggregate.reconstruct({
    rankingId: RankingId.of(id),
    rankingTitle: new RankingTitle("テストランキング"),
    publicStatus: new PublicStatus(1),
    icon: new RankingIcon(1),
    memo: new RankingMemo(""),
    userId: UserId.of("user-1"),
    rankingOrderEntityList: [],
    rankingTagEntityList: [],
    isDeleted: false,
    isFavorite,
  });
}

describe("BulkSoftDeleteMyRankingUsecase", () => {
  let mockRepository: IBulkSoftDeleteMyRankingRepository;
  let usecase: BulkSoftDeleteMyRankingUsecase;

  beforeEach(() => {
    mockRepository = {
      findRankings: vi.fn(),
      deleteRankings: vi.fn(),
    };
    usecase = new BulkSoftDeleteMyRankingUsecase(mockRepository);
  });

  const userId = UserId.of("user-1");
  const rankingIds = [RankingId.of("ranking-1"), RankingId.of("ranking-2")];

  it("お気に入りが含まれない場合、全件削除されること", async () => {
    vi.mocked(mockRepository.findRankings).mockResolvedValue([
      buildRanking("ranking-1", false),
      buildRanking("ranking-2", false),
    ]);

    const result = await usecase.execute(userId, rankingIds);

    expect(result.value).toEqual({ deletedCount: 2, skippedCount: 0 });
    expect(mockRepository.deleteRankings).toHaveBeenCalledTimes(1);
    const passedRankings = vi.mocked(mockRepository.deleteRankings).mock.calls[0][0];
    expect(passedRankings.map((ranking) => ranking.id)).toEqual(["ranking-1", "ranking-2"]);
    expect(passedRankings.every((ranking) => ranking.isDeleted())).toBe(true);
  });

  it("お気に入りが一部含まれる場合、お気に入り以外のみ削除されスキップ件数が返ること", async () => {
    vi.mocked(mockRepository.findRankings).mockResolvedValue([
      buildRanking("ranking-1", true),
      buildRanking("ranking-2", false),
    ]);

    const result = await usecase.execute(userId, rankingIds);

    expect(result.value).toEqual({ deletedCount: 1, skippedCount: 1 });
    expect(mockRepository.deleteRankings).toHaveBeenCalledTimes(1);
    const passedRankings = vi.mocked(mockRepository.deleteRankings).mock.calls[0][0];
    expect(passedRankings.map((ranking) => ranking.id)).toEqual(["ranking-2"]);
    expect(passedRankings.every((ranking) => ranking.isDeleted())).toBe(true);
  });

  it("全件お気に入りの場合、いずれも削除されずスキップ件数のみ返ること", async () => {
    vi.mocked(mockRepository.findRankings).mockResolvedValue([
      buildRanking("ranking-1", true),
      buildRanking("ranking-2", true),
    ]);

    const result = await usecase.execute(userId, rankingIds);

    expect(result.value).toEqual({ deletedCount: 0, skippedCount: 2 });
    expect(mockRepository.deleteRankings).toHaveBeenCalledTimes(1);
    expect(mockRepository.deleteRankings).toHaveBeenCalledWith([]);
  });

  it("対象が0件（所有権外・削除済み等）の場合、0件が返ること", async () => {
    vi.mocked(mockRepository.findRankings).mockResolvedValue([]);

    const result = await usecase.execute(userId, rankingIds);

    expect(result.value).toEqual({ deletedCount: 0, skippedCount: 0 });
    expect(mockRepository.deleteRankings).toHaveBeenCalledWith([]);
  });
});
