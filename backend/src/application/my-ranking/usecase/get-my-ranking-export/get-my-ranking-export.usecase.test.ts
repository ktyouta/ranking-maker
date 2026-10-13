import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetMyRankingExportUsecase } from "..";
import type { IGetMyRankingExportRepository } from "../../../../domain/my-ranking";
import { UserId } from "../../../../domain/shared";

const userId = UserId.of("user-1");

describe("GetMyRankingExportUsecase", () => {
  let repository: IGetMyRankingExportRepository;
  let usecase: GetMyRankingExportUsecase;

  beforeEach(() => {
    repository = { findRankings: vi.fn().mockResolvedValue([]), findRankingOrders: vi.fn().mockResolvedValue([]) };
    usecase = new GetMyRankingExportUsecase(repository);
  });

  it("空のIDと件数超過の違反は項目名付きですべて返し、DB を問い合わせないこと", async () => {
    const ids = ["ranking-1", "", ...Array.from({ length: GetMyRankingExportUsecase.MAX_RANKING_ID_COUNT }, (_, i) => `ranking-${i + 2}`)];

    const result = await usecase.execute({ userId, rankingIds: ids });

    expect(result._unsafeUnwrapErr()).toEqual({
      type: "INVALID_INPUT",
      errors: [
        { field: "ids.1", error: { type: "RANKING_ID_EMPTY" } },
        { field: "ids", error: { type: "TOO_MANY_RANKING_IDS", max: GetMyRankingExportUsecase.MAX_RANKING_ID_COUNT } },
      ],
    });
    expect(repository.findRankings).not.toHaveBeenCalled();
  });

  it("IDが0件の場合は EMPTY_RANKING_IDS を返すこと", async () => {
    const result = await usecase.execute({ userId, rankingIds: [] });

    expect(result._unsafeUnwrapErr()).toEqual({ type: "INVALID_INPUT", errors: [{ field: "ids", error: { type: "EMPTY_RANKING_IDS" } }] });
    expect(repository.findRankings).not.toHaveBeenCalled();
  });

  it("IDが上限件数ちょうどの場合は所有権フィルタに進むこと", async () => {
    const ids = Array.from({ length: GetMyRankingExportUsecase.MAX_RANKING_ID_COUNT }, (_, i) => `ranking-${i}`);

    const result = await usecase.execute({ userId, rankingIds: ids });

    expect(result._unsafeUnwrap().value).toEqual([]);
    const [, passedIds] = vi.mocked(repository.findRankings).mock.calls[0];
    expect(passedIds.map((id) => id.value)).toEqual(ids);
  });

  it("所有するランキングのIDだけでオーダーを取得すること", async () => {
    vi.mocked(repository.findRankings).mockResolvedValue([{ id: "ranking-1", title: "テストランキング" }]);

    await usecase.execute({ userId, rankingIds: ["ranking-1", "other-user-ranking"] });

    const [passedIds] = vi.mocked(repository.findRankingOrders).mock.calls[0];
    expect(passedIds.map((id) => id.value)).toEqual(["ranking-1"]);
  });
});
