import { describe, it, expect, vi, beforeEach } from "vitest";
import { BulkSoftDeleteRankingUsecase } from "..";
import type { IBulkSoftDeleteRankingRepository } from "../../../../domain/ranking";
import { PublicStatus, RankingAggregate, RankingIcon, RankingMemo, RankingTitle } from "../../../../domain/ranking";
import { RankingId, UserId } from "../../../../domain/shared";

function buildRanking(id: string, isFavorite: boolean) {
  return RankingAggregate.reconstruct({
    rankingId: RankingId.of(id),
    rankingTitle: RankingTitle.of("テストランキング"),
    publicStatus: PublicStatus.of(1),
    icon: RankingIcon.of(1),
    memo: RankingMemo.of(""),
    userId: UserId.of("user-1"),
    rankingOrderEntityList: [],
    rankingTagEntityList: [],
    isDeleted: false,
    isFavorite,
  });
}

describe("BulkSoftDeleteRankingUsecase", () => {
  let mockRepository: IBulkSoftDeleteRankingRepository;
  let usecase: BulkSoftDeleteRankingUsecase;

  beforeEach(() => {
    mockRepository = {
      findRankings: vi.fn(),
      deleteRankings: vi.fn(),
    };
    usecase = new BulkSoftDeleteRankingUsecase(mockRepository);
  });

  const userId = UserId.of("user-1");
  const rankingIds = ["ranking-1", "ranking-2"];

  it("お気に入りが含まれない場合、全件削除されること", async () => {
    vi.mocked(mockRepository.findRankings).mockResolvedValue([
      buildRanking("ranking-1", false),
      buildRanking("ranking-2", false),
    ]);

    const result = await usecase.execute({ userId, rankingIds });

    expect(result._unsafeUnwrap().value).toEqual({ deletedCount: 2, skippedCount: 0 });
    expect(mockRepository.deleteRankings).toHaveBeenCalledTimes(1);
    const passedRankings = vi.mocked(mockRepository.deleteRankings).mock.calls[0][0];
    expect(passedRankings.map((ranking) => ranking.id)).toEqual(["ranking-1", "ranking-2"]);
    expect(passedRankings.every((ranking) => ranking.toSnapshot().deleteFlg)).toBe(true);
  });

  it("お気に入りが一部含まれる場合、お気に入り以外のみ削除されスキップ件数が返ること", async () => {
    vi.mocked(mockRepository.findRankings).mockResolvedValue([
      buildRanking("ranking-1", true),
      buildRanking("ranking-2", false),
    ]);

    const result = await usecase.execute({ userId, rankingIds });

    expect(result._unsafeUnwrap().value).toEqual({ deletedCount: 1, skippedCount: 1 });
    expect(mockRepository.deleteRankings).toHaveBeenCalledTimes(1);
    const passedRankings = vi.mocked(mockRepository.deleteRankings).mock.calls[0][0];
    expect(passedRankings.map((ranking) => ranking.id)).toEqual(["ranking-2"]);
    expect(passedRankings.every((ranking) => ranking.toSnapshot().deleteFlg)).toBe(true);
  });

  it("全件お気に入りの場合、いずれも削除されずスキップ件数のみ返ること", async () => {
    vi.mocked(mockRepository.findRankings).mockResolvedValue([
      buildRanking("ranking-1", true),
      buildRanking("ranking-2", true),
    ]);

    const result = await usecase.execute({ userId, rankingIds });

    expect(result._unsafeUnwrap().value).toEqual({ deletedCount: 0, skippedCount: 2 });
    expect(mockRepository.deleteRankings).toHaveBeenCalledTimes(1);
    expect(mockRepository.deleteRankings).toHaveBeenCalledWith([]);
  });

  it("対象が0件（所有権外・削除済み等）の場合、0件が返ること", async () => {
    vi.mocked(mockRepository.findRankings).mockResolvedValue([]);

    const result = await usecase.execute({ userId, rankingIds });

    expect(result._unsafeUnwrap().value).toEqual({ deletedCount: 0, skippedCount: 0 });
    expect(mockRepository.deleteRankings).toHaveBeenCalledWith([]);
  });

  describe("入力値の制約", () => {
    it("空のIDと件数超過の違反は項目名付きですべて返し、DB を問い合わせないこと", async () => {
      const ids = ["ranking-1", "", ...Array.from({ length: BulkSoftDeleteRankingUsecase.MAX_RANKING_ID_COUNT }, (_, i) => `ranking-${i + 2}`)];

      const result = await usecase.execute({ userId, rankingIds: ids });

      expect(result._unsafeUnwrapErr()).toEqual({
        type: "INVALID_INPUT",
        errors: [
          { field: "ids.1", error: { type: "RANKING_ID_EMPTY" } },
          { field: "ids", error: { type: "TOO_MANY_RANKING_IDS", max: BulkSoftDeleteRankingUsecase.MAX_RANKING_ID_COUNT } },
        ],
      });
      expect(mockRepository.findRankings).not.toHaveBeenCalled();
    });

    it("IDが0件の場合は EMPTY_RANKING_IDS を返すこと", async () => {
      const result = await usecase.execute({ userId, rankingIds: [] });

      expect(result._unsafeUnwrapErr()).toEqual({ type: "INVALID_INPUT", errors: [{ field: "ids", error: { type: "EMPTY_RANKING_IDS" } }] });
      expect(mockRepository.findRankings).not.toHaveBeenCalled();
    });

    it("IDが上限件数ちょうどの場合は所有権フィルタに進むこと", async () => {
      vi.mocked(mockRepository.findRankings).mockResolvedValue([]);
      const ids = Array.from({ length: BulkSoftDeleteRankingUsecase.MAX_RANKING_ID_COUNT }, (_, i) => `ranking-${i}`);

      const result = await usecase.execute({ userId, rankingIds: ids });

      expect(result.isOk()).toBe(true);
      const [, passedIds] = vi.mocked(mockRepository.findRankings).mock.calls[0];
      expect(passedIds.map((id) => id.value)).toEqual(ids);
    });
  });
});
