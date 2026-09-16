import { describe, it, expect, vi, beforeEach } from "vitest";
import { BulkSoftDeleteMyRankingUsecase } from "../../../../src/application/my-ranking";
import type { IBulkSoftDeleteMyRankingRepository } from "../../../../src/domain/my-ranking";
import { RankingId } from "../../../../src/domain/shared";
import { UserId } from "../../../../src/domain/user";

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
      { id: "ranking-1", isFavorite: false },
      { id: "ranking-2", isFavorite: false },
    ]);

    const result = await usecase.execute(userId, rankingIds);

    expect(result).toEqual({ deletedCount: 2, skippedCount: 0 });
    expect(mockRepository.deleteRankings).toHaveBeenCalledTimes(1);
    const deletedIds = vi.mocked(mockRepository.deleteRankings).mock.calls[0][0];
    expect(deletedIds.map((id) => id.value)).toEqual(["ranking-1", "ranking-2"]);
  });

  it("お気に入りが一部含まれる場合、お気に入り以外のみ削除されスキップ件数が返ること", async () => {
    vi.mocked(mockRepository.findRankings).mockResolvedValue([
      { id: "ranking-1", isFavorite: true },
      { id: "ranking-2", isFavorite: false },
    ]);

    const result = await usecase.execute(userId, rankingIds);

    expect(result).toEqual({ deletedCount: 1, skippedCount: 1 });
    expect(mockRepository.deleteRankings).toHaveBeenCalledTimes(1);
    const deletedIds = vi.mocked(mockRepository.deleteRankings).mock.calls[0][0];
    expect(deletedIds.map((id) => id.value)).toEqual(["ranking-2"]);
  });

  it("全件お気に入りの場合、削除は実行されずスキップ件数のみ返ること", async () => {
    vi.mocked(mockRepository.findRankings).mockResolvedValue([
      { id: "ranking-1", isFavorite: true },
      { id: "ranking-2", isFavorite: true },
    ]);

    const result = await usecase.execute(userId, rankingIds);

    expect(result).toEqual({ deletedCount: 0, skippedCount: 2 });
    expect(mockRepository.deleteRankings).not.toHaveBeenCalled();
  });

  it("対象が0件（所有権外・削除済み等）の場合、削除は実行されず0件が返ること", async () => {
    vi.mocked(mockRepository.findRankings).mockResolvedValue([]);

    const result = await usecase.execute(userId, rankingIds);

    expect(result).toEqual({ deletedCount: 0, skippedCount: 0 });
    expect(mockRepository.deleteRankings).not.toHaveBeenCalled();
  });
});
