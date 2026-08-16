import { err, ok, Result } from "neverthrow";
import { IRestoreMyRankingRepository, RankingAggregate, RankingId, RankingTitle, RankingTitleUniquenessDomainService } from "../../../domain";
import { UserId } from "../../../domain/user";

export type RestoreMyRankingError =
  | { type: "NOT_FOUND" }
  | { type: "DUPLICATE_TITLE" };

/**
 * ランキング復元ユースケース
 */
export class RestoreMyRankingUsecase {
  constructor(private readonly repository: IRestoreMyRankingRepository,
    private readonly uniquenessService: RankingTitleUniquenessDomainService,
  ) { }

  /**
   * ランキング復元
   * @param userId 復元対象を所有するユーザーID
   * @param rankingId 復元対象のランキングID
   * @returns 復元成功時は ok（復元後の集約）、対象が存在しない場合は NOT_FOUND、タイトルが重複する場合は DUPLICATE_TITLE
   */
  async execute(userId: UserId, rankingId: RankingId): Promise<Result<RankingAggregate, RestoreMyRankingError>> {

    // 削除済みランキングの存在・所有確認
    const ranking = await this.repository.findRanking(userId, rankingId);

    if (!ranking) {
      return err({ type: "NOT_FOUND" });
    }

    // タイトル重複（削除されている間に同名の別ランキングが作成されている可能性があるため再検証する）
    const rankingTitle = new RankingTitle(ranking.title);
    if (await this.uniquenessService.isDuplicated({ userId, rankingTitle, rankingId })) {
      return err({ type: "DUPLICATE_TITLE" });
    }

    ranking.restore();

    // ランキング本体と項目を復元
    await this.repository.restoreRanking(ranking);

    return ok(ranking);
  }
}
