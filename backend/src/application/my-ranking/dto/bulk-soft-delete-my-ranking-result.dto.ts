export type BulkSoftDeleteMyRankingResultType = {
  deletedCount: number;
  skippedCount: number;
};

/**
 * ランキング一括削除結果 DTO
 */
export class BulkSoftDeleteMyRankingResultDto {
  private readonly _value: BulkSoftDeleteMyRankingResultType;

  /**
   * @param deletedCount 削除した件数
   * @param skippedCount お気に入りのためスキップした件数
   */
  constructor(deletedCount: number, skippedCount: number) {
    this._value = { deletedCount, skippedCount };
  }

  get value(): BulkSoftDeleteMyRankingResultType {
    return this._value;
  }
}
