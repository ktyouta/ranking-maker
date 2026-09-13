import { err, ok, Result } from "neverthrow";
import { IUpdateFavoriteMyRankingRepository, RankingId } from "../../../domain";
import { UserId } from "../../../domain/user";

export type UpdateFavoriteMyRankingError =
  | { type: "NOT_FOUND" };

/**
 * お気に入り更新ユースケース
 */
export class UpdateFavoriteMyRankingUsecase {
  constructor(private readonly repository: IUpdateFavoriteMyRankingRepository) { }

  /**
   * お気に入り状態を更新する
   * @param userId 更新対象を所有するユーザーID
   * @param rankingId 更新対象のランキングID
   * @param isFavorite 更新後のお気に入り状態
   * @returns 更新成功時は ok、対象が存在しない場合は NOT_FOUND
   */
  async execute(userId: UserId, rankingId: RankingId, isFavorite: boolean): Promise<Result<void, UpdateFavoriteMyRankingError>> {

    // 対象ランキングの存在・所有確認（生存行のみ）
    const ranking = await this.repository.findRanking(userId, rankingId);

    if (ranking.length === 0) {
      return err({ type: "NOT_FOUND" });
    }

    await this.repository.updateFavorite(rankingId, isFavorite);

    return ok(undefined);
  }
}
