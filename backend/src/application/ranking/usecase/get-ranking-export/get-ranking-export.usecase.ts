import { err, ok, Result } from "neverthrow";
import { type IGetRankingExportRepository, RankingId, type RankingIdError } from "../../../../domain";
import { UserId } from "../../../../domain/shared";
import { GetRankingExportResultDto } from "../../dto";

/**
 * ランキングCSVエクスポートの入力値の制約違反（field は入力値の項目名。ID は `ids.{IDの添字}`、ID の件数の違反は `ids`）
 */
export type GetRankingExportInputError =
  | { field: `ids.${number}`; error: RankingIdError }
  | { field: "ids"; error: { type: "EMPTY_RANKING_IDS" } | { type: "TOO_MANY_RANKING_IDS"; max: number } };

export type GetRankingExportError = { type: "INVALID_INPUT"; errors: GetRankingExportInputError[] };

type PropsType = {
  userId: UserId;
  rankingIds: string[];
}

/**
 * 1回のエクスポートで受け付けるランキングIDの件数を判定する
 * @param count ランキングIDの件数
 * @returns 1件以上・上限以下の場合は成功、それ以外は件数の違反を持つ Result
 */
function validateRankingIdCount(count: number): Result<undefined, GetRankingExportInputError> {
  if (count === 0) {
    return err({ field: "ids", error: { type: "EMPTY_RANKING_IDS" } });
  }

  if (count > GetRankingExportUsecase.MAX_RANKING_ID_COUNT) {
    return err({ field: "ids", error: { type: "TOO_MANY_RANKING_IDS", max: GetRankingExportUsecase.MAX_RANKING_ID_COUNT } });
  }

  return ok(undefined);
}

/**
 * ランキングCSVエクスポート用データ取得ユースケース
 */
export class GetRankingExportUsecase {

  // 1回のエクスポートで受け付けるランキングIDの最大件数
  static readonly MAX_RANKING_ID_COUNT = 100;

  constructor(private readonly repository: IGetRankingExportRepository) { }

  /**
   * 指定IDのうち、自身が所有するランキングの項目一覧を取得する
   *
   * セキュリティ上必須: 必ず①所有権フィルタ済みのランキング一覧を取得 →
   * ②その結果に含まれる rankingId のみをオーダー取得に渡す、の順序を守る。
   * クライアントから渡された生の rankingIds をオーダー取得にそのまま渡さない。
   * @param userId エクスポート対象を所有するユーザーID
   * @param rankingIds エクスポート対象のランキングID一覧（クライアントからの未フィルタな入力）
   * @returns 成功時はエクスポート対象のランキングと項目一覧（所有するランキングがない場合は空）。
   * 入力値が制約を満たさない場合は INVALID_INPUT（違反はすべて返し、DB は問い合わせない）
   */
  async execute({ userId, rankingIds }: PropsType): Promise<Result<GetRankingExportResultDto, GetRankingExportError>> {

    // 入力値の制約チェック
    const input = Result.combineWithAllErrors([
      Result.combineWithAllErrors(
        rankingIds.map((id, index) => RankingId.fromInput(id).mapErr((error): GetRankingExportInputError => ({ field: `ids.${index}`, error }))),
      ),
      validateRankingIdCount(rankingIds.length),
    ]);
    if (input.isErr()) {
      return err({ type: "INVALID_INPUT", errors: input.error.flat() });
    }
    const [ids] = input.value;

    // ①所有権フィルタ済みのランキング一覧
    const rankings = await this.repository.findRankings(userId, ids);

    if (rankings.length === 0) {
      return ok(new GetRankingExportResultDto([], []));
    }

    // ②①に含まれる rankingId のみでオーダーを取得
    const ownedRankingIds = rankings.map((ranking) => RankingId.of(ranking.id));
    const orders = await this.repository.findRankingOrders(ownedRankingIds);

    return ok(new GetRankingExportResultDto(rankings, orders));
  }
}
