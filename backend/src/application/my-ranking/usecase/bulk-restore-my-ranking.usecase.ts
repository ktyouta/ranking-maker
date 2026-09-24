import { IBulkRestoreMyRankingRepository, RankingId, RankingTitleUniquenessDomainService } from "../../../domain";
import { UserId } from "../../../domain/shared";

export type BulkRestoreMyRankingResultType = {
  restoreCount: number;
  skippedCount: number;
};

/**
 * ランキング一括復元ユースケース
 */
export class BulkRestoreMyRankingUsecase {
  constructor(private readonly repository: IBulkRestoreMyRankingRepository,
    private readonly uniquenessService: RankingTitleUniquenessDomainService,
  ) { }

  /**
   * 指定IDのうち、自身が所有するランキングを一括復元する。
   * 同名の別ランキングが既に存在するものは復元対象から除外される（スキップ）。
   *
   * セキュリティ上必須: 必ず所有権フィルタ済みのランキング一覧（findRankings の戻り値）のみを
   * 復元対象として扱う。クライアントから渡された生の rankingIds をそのまま復元に渡さない。
   * @param userId 復元対象を所有するユーザーID
   * @param rankingIds 復元対象のランキングID一覧（クライアントからの未フィルタな入力）
   * @returns 実際に復元した件数と、同名重複のためスキップした件数
   */
  async execute(userId: UserId, rankingIds: RankingId[]): Promise<BulkRestoreMyRankingResultType> {

    // 所有権フィルタ済みのランキング一覧（削除済み行のみ）
    const rankings = await this.repository.findRankings(userId, rankingIds);
    const duplicatedRankings = await this.uniquenessService.findDuplicated(userId, rankings);

    // 同名重複のため復元できないものを除外する
    const restorableRankings = rankings.filter((ranking) => {
      return !duplicatedRankings.find((duplicate) => duplicate.id === ranking.id);
    });

    restorableRankings.forEach((ranking) => ranking.restore());
    await this.repository.restoreRankings(restorableRankings);

    return { restoreCount: restorableRankings.length, skippedCount: duplicatedRankings.length };
  }
}
