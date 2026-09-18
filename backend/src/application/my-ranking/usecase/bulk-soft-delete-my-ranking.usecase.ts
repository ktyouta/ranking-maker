import { IBulkSoftDeleteMyRankingRepository, RankingId } from "../../../domain";
import { UserId } from "../../../domain/user";

export type BulkSoftDeleteMyRankingResultType = {
  deletedCount: number;
  skippedCount: number;
};

/**
 * ランキング一括削除ユースケース
 */
export class BulkSoftDeleteMyRankingUsecase {
  constructor(private readonly repository: IBulkSoftDeleteMyRankingRepository) { }

  /**
   * 指定IDのうち、自身が所有するランキングを一括削除（論理削除）する。
   * お気に入り登録済みのランキングは delete() 内で削除対象から除外される（スキップ）。
   *
   * セキュリティ上必須: 必ず所有権フィルタ済みのランキング一覧（findRankings の戻り値）のみを
   * 削除対象として扱う。クライアントから渡された生の rankingIds をそのまま削除に渡さない。
   * @param userId 削除対象を所有するユーザーID
   * @param rankingIds 削除対象のランキングID一覧（クライアントからの未フィルタな入力）
   * @returns 実際に削除した件数と、お気に入りのためスキップした件数
   */
  async execute(userId: UserId, rankingIds: RankingId[]): Promise<BulkSoftDeleteMyRankingResultType> {

    // ①所有権フィルタ済みのランキング一覧（生存行のみ）
    const rankings = await this.repository.findRankings(userId, rankingIds);

    // 削除を実行し、実際に削除できたものだけを残す（お気に入りは delete() 内で除外される）
    const deletableRankings = rankings.filter((ranking) => ranking.delete().isOk());
    await this.repository.deleteRankings(rankings);

    const skippedCount = rankings.length - deletableRankings.length;

    return { deletedCount: deletableRankings.length, skippedCount };
  }
}
