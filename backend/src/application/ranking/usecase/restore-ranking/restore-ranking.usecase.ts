import { err, ok, Result } from "neverthrow";
import { type IRestoreRankingRepository, RankingId, RankingTitle, RankingTitleUniquenessDomainService } from "../../../../domain";
import { UserId } from "../../../../domain/shared";
import { RestoreRankingResultDto } from "../../dto";

export type RestoreRankingError =
  | { type: "NOT_FOUND" }
  | { type: "DUPLICATE_TITLE" };

type PropsType = {
  userId: UserId;
  rankingId: string;
}

/**
 * ランキング復元ユースケース
 */
export class RestoreRankingUsecase {
  constructor(private readonly repository: IRestoreRankingRepository,
    private readonly uniquenessService: RankingTitleUniquenessDomainService,
  ) { }

  /**
   * ランキング復元
   * @param userId 復元対象を所有するユーザーID
   * @param rankingId 復元対象のランキングID
   * @returns 復元成功時は ok（復元後のランキング）、対象が存在しない場合は NOT_FOUND、タイトルが重複する場合は DUPLICATE_TITLE
   * @throws rankingId が空の場合（DB は問い合わせない）
   */
  async execute({ userId, rankingId }: PropsType): Promise<Result<RestoreRankingResultDto, RestoreRankingError>> {
    const id = RankingId.of(rankingId);

    // 削除済みランキングの存在・所有確認
    const ranking = await this.repository.findRanking(userId, id);

    if (!ranking) {
      return err({ type: "NOT_FOUND" });
    }

    // タイトル重複（削除されている間に同名の別ランキングが作成されている可能性があるため再検証する）
    const rankingTitle = RankingTitle.of(ranking.title);
    if (await this.uniquenessService.isDuplicated({ userId, rankingTitle, rankingId: id })) {
      return err({ type: "DUPLICATE_TITLE" });
    }

    ranking.restore();

    // ランキング本体と項目を復元
    await this.repository.restoreRanking(ranking);

    return ok(new RestoreRankingResultDto(ranking));
  }
}
