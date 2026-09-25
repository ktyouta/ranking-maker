export type BulkRestoreMyRankingResultType = {
  restoreCount: number;
  skippedCount: number;
};

/**
 * ランキング一括復元結果 DTO
 */
export class BulkRestoreMyRankingResultDto {
  private readonly _value: BulkRestoreMyRankingResultType;

  /**
   * @param restoreCount 復元した件数
   * @param skippedCount 同名のランキングが存在するためスキップした件数
   */
  constructor(restoreCount: number, skippedCount: number) {
    this._value = { restoreCount, skippedCount };
  }

  get value(): BulkRestoreMyRankingResultType {
    return this._value;
  }
}
