import type { BulkSoftDeleteMyRankingResultType } from "../../../application";

export type BulkSoftDeleteMyRankingResponseType = {
  message: string;
  deletedCount: number;
  skippedCount: number;
};

/**
 * ランキング一括削除レスポンス DTO
 * 削除件数・お気に入りによるスキップ件数から通知文言を組み立てる。
 */
export class BulkSoftDeleteMyRankingResponseDto {
  private readonly _value: BulkSoftDeleteMyRankingResponseType;

  constructor(result: BulkSoftDeleteMyRankingResultType) {
    this._value = {
      message: BulkSoftDeleteMyRankingResponseDto.buildMessage(result),
      deletedCount: result.deletedCount,
      skippedCount: result.skippedCount,
    };
  }

  private static buildMessage({ deletedCount, skippedCount }: BulkSoftDeleteMyRankingResultType): string {
    if (deletedCount === 0 && skippedCount === 0) {
      return "削除対象のランキングが見つかりませんでした。";
    }
    if (deletedCount === 0) {
      return "選択したランキングはすべてお気に入りのため削除できませんでした。";
    }
    if (skippedCount === 0) {
      return `${deletedCount}件をゴミ箱に移動しました。`;
    }
    return `${deletedCount}件をゴミ箱に移動しました（${skippedCount}件はお気に入りのためスキップされました）。`;
  }

  get value(): BulkSoftDeleteMyRankingResponseType {
    return this._value;
  }
}
