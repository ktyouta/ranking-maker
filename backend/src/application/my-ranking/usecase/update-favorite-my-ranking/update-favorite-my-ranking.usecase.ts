import { err, ok, Result } from "neverthrow";
import { type IUpdateFavoriteMyRankingRepository, RankingId } from "../../../../domain";
import { UserId } from "../../../../domain/shared";

export type UpdateFavoriteMyRankingError =
  | { type: "NOT_FOUND" };

type PropsType = {
  userId: UserId;
  rankingId: string;
  isFavorite: boolean;
}

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
   * @throws rankingId が空の場合（DB は問い合わせない）
   */
  async execute({ userId, rankingId, isFavorite }: PropsType): Promise<Result<void, UpdateFavoriteMyRankingError>> {
    const id = RankingId.of(rankingId);

    // 対象ランキングの存在・所有確認（生存行のみ）
    const ranking = await this.repository.findRanking(userId, id);

    if (ranking.length === 0) {
      return err({ type: "NOT_FOUND" });
    }

    await this.repository.updateFavorite(id, isFavorite);

    return ok(undefined);
  }
}
