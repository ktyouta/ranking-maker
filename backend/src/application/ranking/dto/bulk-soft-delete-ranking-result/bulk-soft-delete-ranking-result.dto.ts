export type BulkSoftDeleteRankingResultType = {
  deletedCount: number;
  skippedCount: number;
};

/**
 * ランキング一括削除結果 DTO
 */
export class BulkSoftDeleteRankingResultDto {
  private readonly _value: BulkSoftDeleteRankingResultType;

  /**
   * @param deletedCount 削除した件数
   * @param skippedCount お気に入りのためスキップした件数
   */
  constructor(deletedCount: number, skippedCount: number) {
    this._value = { deletedCount, skippedCount };
  }

  get value(): BulkSoftDeleteRankingResultType {
    return this._value;
  }
}
