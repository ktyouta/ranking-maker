import { err, ok, Result } from "neverthrow";
import { IPermanentDeleteMyRankingRepository, RankingId } from "../../../domain";
import { UserId } from "../../../domain/user";

export type PermanentDeleteMyRankingError =
  | { type: "NOT_FOUND" };

/**
 * ランキング完全削除ユースケース
 */
export class PermanentDeleteMyRankingUsecase {
  constructor(private readonly repository: IPermanentDeleteMyRankingRepository) { }

  /**
   * ランキング完全削除（物理削除）
   * @param userId 削除対象を所有するユーザーID
   * @param rankingId 削除対象のランキングID
   * @returns 削除成功時は ok、対象が存在しない場合は NOT_FOUND
   */
  async execute(userId: UserId, rankingId: RankingId): Promise<Result<void, PermanentDeleteMyRankingError>> {

    // 対象ランキングの存在・所有確認（ゴミ箱内のみ）
    const ranking = await this.repository.findRanking(userId, rankingId);

    if (ranking.length === 0) {
      return err({ type: "NOT_FOUND" });
    }

    // ランキング本体を完全削除
    await this.repository.deleteRanking(rankingId);

    return ok(undefined);
  }
}
