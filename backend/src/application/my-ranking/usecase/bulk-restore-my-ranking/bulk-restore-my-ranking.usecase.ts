import { err, ok, Result } from "neverthrow";
import { type IBulkRestoreMyRankingRepository, RankingId, type RankingIdError, RankingTitleUniquenessDomainService } from "../../../../domain";
import { UserId } from "../../../../domain/shared";
import { BulkRestoreMyRankingResultDto } from "../../dto";

/**
 * ランキング一括復元の入力値の制約違反（field は入力値の項目名。ID は `ids.{IDの添字}`、ID の件数の違反は `ids`）
 */
export type BulkRestoreMyRankingInputError =
  | { field: `ids.${number}`; error: RankingIdError }
  | { field: "ids"; error: { type: "EMPTY_RANKING_IDS" } | { type: "TOO_MANY_RANKING_IDS"; max: number } };

export type BulkRestoreMyRankingError = { type: "INVALID_INPUT"; errors: BulkRestoreMyRankingInputError[] };

type PropsType = {
  userId: UserId;
  rankingIds: string[];
}

/**
 * 1回の一括復元で受け付けるランキングIDの件数を判定する
 * @param count ランキングIDの件数
 * @returns 1件以上・上限以下の場合は成功、それ以外は件数の違反を持つ Result
 */
function validateRankingIdCount(count: number): Result<undefined, BulkRestoreMyRankingInputError> {
  if (count === 0) {
    return err({ field: "ids", error: { type: "EMPTY_RANKING_IDS" } });
  }

  if (count > BulkRestoreMyRankingUsecase.MAX_RANKING_ID_COUNT) {
    return err({ field: "ids", error: { type: "TOO_MANY_RANKING_IDS", max: BulkRestoreMyRankingUsecase.MAX_RANKING_ID_COUNT } });
  }

  return ok(undefined);
}

/**
 * ランキング一括復元ユースケース
 */
export class BulkRestoreMyRankingUsecase {

  // 1回の一括復元で受け付けるランキングIDの最大件数
  static readonly MAX_RANKING_ID_COUNT = 100;

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
   * @returns 成功時は実際に復元した件数と、同名重複のためスキップした件数。
   * 入力値が制約を満たさない場合は INVALID_INPUT（違反はすべて返し、DB は問い合わせない）
   */
  async execute({ userId, rankingIds }: PropsType): Promise<Result<BulkRestoreMyRankingResultDto, BulkRestoreMyRankingError>> {

    // 入力値の制約チェック
    const input = Result.combineWithAllErrors([
      Result.combineWithAllErrors(
        rankingIds.map((id, index) => RankingId.create(id).mapErr((error): BulkRestoreMyRankingInputError => ({ field: `ids.${index}`, error }))),
      ),
      validateRankingIdCount(rankingIds.length),
    ]);
    if (input.isErr()) {
      return err({ type: "INVALID_INPUT", errors: input.error.flat() });
    }
    const [ids] = input.value;

    // 所有権フィルタ済みのランキング一覧（削除済み行のみ）
    const rankings = await this.repository.findRankings(userId, ids);
    const duplicatedRankings = await this.uniquenessService.findDuplicated(userId, rankings);

    // 同名重複のため復元できないものを除外する
    const restorableRankings = rankings.filter((ranking) => {
      return !duplicatedRankings.find((duplicate) => duplicate.id === ranking.id);
    });

    restorableRankings.forEach((ranking) => ranking.restore());
    await this.repository.restoreRankings(restorableRankings);

    return ok(new BulkRestoreMyRankingResultDto(restorableRankings.length, duplicatedRankings.length));
  }
}
