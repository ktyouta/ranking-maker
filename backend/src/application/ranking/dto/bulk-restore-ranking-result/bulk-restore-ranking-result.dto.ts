export type BulkRestoreRankingResultType = {
  restoreCount: number;
  skippedCount: number;
};

/**
 * ランキング一括復元結果 DTO
 */
export class BulkRestoreRankingResultDto {
  private readonly _value: BulkRestoreRankingResultType;

  /**
   * @param restoreCount 復元した件数
   * @param skippedCount 同名のランキングが存在するためスキップした件数
   */
  constructor(restoreCount: number, skippedCount: number) {
    this._value = { restoreCount, skippedCount };
  }

  get value(): BulkRestoreRankingResultType {
    return this._value;
  }
}
