import type { BulkRestoreMyRankingResultType } from "../../../application";

export type BulkRestoreMyRankingResponseType = {
  message: string;
  restoreCount: number;
  skippedCount: number;
};

/**
 * ランキング一括削除レスポンス DTO
 * 削除件数・お気に入りによるスキップ件数から通知文言を組み立てる。
 */
export class BulkRestoreMyRankingResponseDto {
  private readonly _value: BulkRestoreMyRankingResponseType;

  constructor(result: BulkRestoreMyRankingResultType) {
    this._value = {
      message: BulkRestoreMyRankingResponseDto.buildMessage(result),
      restoreCount: result.restoreCount,
      skippedCount: result.skippedCount,
    };
  }

  private static buildMessage({ restoreCount, skippedCount }: BulkRestoreMyRankingResultType): string {
    if (restoreCount === 0 && skippedCount === 0) {
      return "復元対象のランキングが見つかりませんでした。";
    }
    if (skippedCount === 0) {
      return `${restoreCount}件を復元しました。`;
    }
    return `${restoreCount}件を復元しました（${skippedCount}件は同名のランキングが存在するためスキップされました）。`;
  }

  get value(): BulkRestoreMyRankingResponseType {
    return this._value;
  }
}
