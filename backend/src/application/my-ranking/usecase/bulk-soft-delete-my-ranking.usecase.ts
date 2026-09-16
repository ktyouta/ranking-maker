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
   * お気に入り登録済みのランキングは削除対象から除外する（スキップ）。
   *
   * セキュリティ上必須: 必ず①所有権フィルタ済みのランキング一覧を取得 →
   * ②その結果からお気に入りを除いた rankingId のみを削除に渡す、の順序を守る。
   * クライアントから渡された生の rankingIds をそのまま削除に渡さない。
   * @param userId 削除対象を所有するユーザーID
   * @param rankingIds 削除対象のランキングID一覧（クライアントからの未フィルタな入力）
   * @returns 実際に削除した件数と、お気に入りのためスキップした件数
   */
  async execute(userId: UserId, rankingIds: RankingId[]): Promise<BulkSoftDeleteMyRankingResultType> {

    // ①所有権フィルタ済みのランキング一覧（生存行のみ）
    const rankings = await this.repository.findRankings(userId, rankingIds);

    // お気に入り登録済みは削除対象から除外する
    const deletableRankings = rankings.filter((ranking) => !ranking.isFavorite);
    const skippedCount = rankings.length - deletableRankings.length;

    if (deletableRankings.length === 0) {
      return { deletedCount: 0, skippedCount };
    }

    // ②①からお気に入りを除いた rankingId のみで削除を実行
    const deletableRankingIds = deletableRankings.map((ranking) => RankingId.of(ranking.id));
    await this.repository.deleteRankings(deletableRankingIds);

    return { deletedCount: deletableRankings.length, skippedCount };
  }
}
