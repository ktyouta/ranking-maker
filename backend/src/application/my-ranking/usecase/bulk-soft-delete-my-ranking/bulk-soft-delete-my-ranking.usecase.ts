import { err, ok, Result } from "neverthrow";
import { type IBulkSoftDeleteMyRankingRepository, RankingId, type RankingIdError } from "../../../../domain";
import { UserId } from "../../../../domain/shared";
import { BulkSoftDeleteMyRankingResultDto } from "../../dto";

/**
 * ランキング一括削除の入力値の制約違反（field は入力値の項目名。ID は `ids.{IDの添字}`、ID の件数の違反は `ids`）
 */
export type BulkSoftDeleteMyRankingInputError =
  | { field: `ids.${number}`; error: RankingIdError }
  | { field: "ids"; error: { type: "EMPTY_RANKING_IDS" } | { type: "TOO_MANY_RANKING_IDS"; max: number } };

export type BulkSoftDeleteMyRankingError = { type: "INVALID_INPUT"; errors: BulkSoftDeleteMyRankingInputError[] };

type PropsType = {
  userId: UserId;
  rankingIds: string[];
}

/**
 * 1回の一括削除で受け付けるランキングIDの件数を判定する
 * @param count ランキングIDの件数
 * @returns 1件以上・上限以下の場合は成功、それ以外は件数の違反を持つ Result
 */
function validateRankingIdCount(count: number): Result<undefined, BulkSoftDeleteMyRankingInputError> {
  if (count === 0) {
    return err({ field: "ids", error: { type: "EMPTY_RANKING_IDS" } });
  }

  if (count > BulkSoftDeleteMyRankingUsecase.MAX_RANKING_ID_COUNT) {
    return err({ field: "ids", error: { type: "TOO_MANY_RANKING_IDS", max: BulkSoftDeleteMyRankingUsecase.MAX_RANKING_ID_COUNT } });
  }

  return ok(undefined);
}

/**
 * ランキング一括削除ユースケース
 */
export class BulkSoftDeleteMyRankingUsecase {

  // 1回の一括削除で受け付けるランキングIDの最大件数
  static readonly MAX_RANKING_ID_COUNT = 100;

  constructor(private readonly repository: IBulkSoftDeleteMyRankingRepository) { }

  /**
   * 指定IDのうち、自身が所有するランキングを一括削除（論理削除）する。
   * お気に入り登録済みのランキングは delete() 内で削除対象から除外される（スキップ）。
   *
   * セキュリティ上必須: 必ず所有権フィルタ済みのランキング一覧（findRankings の戻り値）のみを
   * 削除対象として扱う。クライアントから渡された生の rankingIds をそのまま削除に渡さない。
   * @param userId 削除対象を所有するユーザーID
   * @param rankingIds 削除対象のランキングID一覧（クライアントからの未フィルタな入力）
   * @returns 成功時は実際に削除した件数と、お気に入りのためスキップした件数。
   * 入力値が制約を満たさない場合は INVALID_INPUT（違反はすべて返し、DB は問い合わせない）
   */
  async execute({ userId, rankingIds }: PropsType): Promise<Result<BulkSoftDeleteMyRankingResultDto, BulkSoftDeleteMyRankingError>> {

    // 入力値の制約チェック
    const input = Result.combineWithAllErrors([
      Result.combineWithAllErrors(
        rankingIds.map((id, index) => RankingId.create(id).mapErr((error): BulkSoftDeleteMyRankingInputError => ({ field: `ids.${index}`, error }))),
      ),
      validateRankingIdCount(rankingIds.length),
    ]);
    if (input.isErr()) {
      return err({ type: "INVALID_INPUT", errors: input.error.flat() });
    }
    const [ids] = input.value;

    // ①所有権フィルタ済みのランキング一覧（生存行のみ）
    const rankings = await this.repository.findRankings(userId, ids);

    // 削除を実行し、実際に削除できたものだけを残す（お気に入りは delete() 内で除外される）
    const deletableRankings = rankings.filter((ranking) => ranking.delete().isOk());
    await this.repository.deleteRankings(deletableRankings);

    const skippedCount = rankings.length - deletableRankings.length;

    return ok(new BulkSoftDeleteMyRankingResultDto(deletableRankings.length, skippedCount));
  }
}
