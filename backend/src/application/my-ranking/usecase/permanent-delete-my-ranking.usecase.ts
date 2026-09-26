import { err, ok, Result } from "neverthrow";
import { IPermanentDeleteMyRankingRepository, RankingId, TagUsageDomainService } from "../../../domain";
import { UserId } from "../../../domain/shared";

export type PermanentDeleteMyRankingError =
  | { type: "NOT_FOUND" };

/**
 * ランキング完全削除ユースケース
 */
export class PermanentDeleteMyRankingUsecase {
  constructor(private readonly repository: IPermanentDeleteMyRankingRepository,
    private readonly tagUsageService: TagUsageDomainService,
  ) { }

  /**
   * ランキング完全削除（物理削除）
   * @param userId 削除対象を所有するユーザーID
   * @param rankingId 削除対象のランキングID
   * @returns 削除成功時は ok、対象が存在しない場合は NOT_FOUND
   */
  async execute(userId: UserId, rankingId: RankingId): Promise<Result<void, PermanentDeleteMyRankingError>> {

    // 対象ランキングの存在・所有確認（ゴミ箱内のみ）
    const ranking = await this.repository.findRanking(userId, rankingId);

    if (!ranking) {
      return err({ type: "NOT_FOUND" });
    }

    // 完全削除に伴い手放すタグ
    const releasedTagIds = ranking.releaseTagsOnPermanentDelete();

    // 手放したタグのうち、どのランキングにも紐づかなくなるタグ
    const unusedTagIds = await this.tagUsageService.findUnused({ userId, rankingId, releasedTagIds });

    // ランキング本体を完全削除
    await this.repository.deleteRanking(ranking, unusedTagIds);

    return ok(undefined);
  }
}
