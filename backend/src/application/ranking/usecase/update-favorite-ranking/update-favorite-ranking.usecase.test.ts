import { describe, it, expect, vi, beforeEach } from "vitest";
import { UpdateFavoriteRankingUsecase } from "..";
import type { IUpdateFavoriteRankingRepository } from "../../../../domain/ranking";
import { PublicStatus, RankingAggregate, RankingIcon, RankingMemo, RankingTitle } from "../../../../domain/ranking";
import { RankingId, UserId } from "../../../../domain/shared";

const userId = UserId.of("user-1");
const rankingId = RankingId.of("ranking-1");

function buildRanking(isFavorite: boolean) {
  return RankingAggregate.reconstruct({
    rankingId,
    rankingTitle: RankingTitle.of("テストランキング"),
    publicStatus: PublicStatus.of(1),
    icon: RankingIcon.of(1),
    memo: RankingMemo.of(""),
    userId,
    rankingOrderEntityList: [],
    rankingTagEntityList: [],
    isDeleted: false,
    isFavorite,
  });
}

describe("UpdateFavoriteRankingUsecase", () => {
  let repository: IUpdateFavoriteRankingRepository;
  let usecase: UpdateFavoriteRankingUsecase;

  beforeEach(() => {
    repository = { findRanking: vi.fn(), updateFavorite: vi.fn() };
    usecase = new UpdateFavoriteRankingUsecase(repository);
  });

  it.each([true, false])("お気に入り状態を %s に変更した集約を保存すること", async (isFavorite) => {
    const ranking = buildRanking(!isFavorite);
    vi.mocked(repository.findRanking).mockResolvedValue(ranking);

    const result = await usecase.execute({ userId, rankingId: rankingId.value, isFavorite });

    expect(result.isOk()).toBe(true);
    const [passedRanking] = vi.mocked(repository.updateFavorite).mock.calls[0];
    expect(passedRanking).toBe(ranking);
    expect(passedRanking.isFavorite()).toBe(isFavorite);
  });

  it("対象が存在しない場合は NOT_FOUND を返し、保存しないこと", async () => {
    vi.mocked(repository.findRanking).mockResolvedValue(null);

    const result = await usecase.execute({ userId, rankingId: rankingId.value, isFavorite: true });

    expect(result._unsafeUnwrapErr()).toEqual({ type: "NOT_FOUND" });
    expect(repository.updateFavorite).not.toHaveBeenCalled();
  });
});
