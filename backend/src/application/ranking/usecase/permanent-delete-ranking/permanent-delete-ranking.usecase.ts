import { err, ok, Result } from "neverthrow";
import { type IPermanentDeleteRankingRepository, RankingId, TagUsageDomainService } from "../../../../domain";
import { UserId } from "../../../../domain/shared";

export type PermanentDeleteRankingError =
  | { type: "NOT_FOUND" };

type PropsType = {
  userId: UserId;
  rankingId: string;
}

/**
 * ランキング完全削除ユースケース
 */
export class PermanentDeleteRankingUsecase {
  constructor(private readonly repository: IPermanentDeleteRankingRepository,
    private readonly tagUsageService: TagUsageDomainService,
  ) { }

  /**
   * ランキング完全削除（物理削除）
   * @param userId 削除対象を所有するユーザーID
   * @param rankingId 削除対象のランキングID
   * @returns 削除成功時は ok、対象が存在しない場合は NOT_FOUND
   * @throws rankingId が空の場合（DB は問い合わせない）
   */
  async execute({ userId, rankingId }: PropsType): Promise<Result<void, PermanentDeleteRankingError>> {
    const id = RankingId.of(rankingId);

    // 対象ランキングの存在・所有確認（ゴミ箱内のみ）
    const ranking = await this.repository.findRanking(userId, id);

    if (!ranking) {
      return err({ type: "NOT_FOUND" });
    }

    // 完全削除に伴い手放すタグ
    const releasedTagIds = ranking.releaseTagsOnPermanentDelete();

    // 手放したタグのうち、どのランキングにも紐づかなくなるタグ
    const unusedTagIds = await this.tagUsageService.findUnused({ userId, rankingId: id, releasedTagIds });

    // ランキング本体を完全削除
    await this.repository.deleteRanking(ranking, unusedTagIds);

    return ok(undefined);
  }
}
