import { err, ok, Result } from "neverthrow";
import { ISoftDeleteMyRankingRepository, RankingId } from "../../../domain";
import { UserId } from "../../../domain/user";

export type SoftDeleteMyRankingError =
  | { type: "NOT_FOUND" };

/**
 * ランキング削除ユースケース
 */
export class SoftDeleteMyRankingUsecase {
  constructor(private readonly repository: ISoftDeleteMyRankingRepository) { }

  /**
   * ランキング削除（論理削除）
   * @param userId 削除対象を所有するユーザーID
   * @param rankingId 削除対象のランキングID
   * @returns 削除成功時は ok、対象が存在しない場合は NOT_FOUND
   */
  async execute(userId: UserId, rankingId: RankingId): Promise<Result<void, SoftDeleteMyRankingError>> {

    // 対象ランキングの存在・所有確認（生存行のみ）
    const ranking = await this.repository.findRanking(userId, rankingId);

    if (ranking.length === 0) {
      return err({ type: "NOT_FOUND" });
    }

    // ランキング本体と項目を論理削除
    await this.repository.deleteRanking(rankingId);

    return ok(undefined);
  }
}
