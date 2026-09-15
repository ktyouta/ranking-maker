import type { MyRankingExportResultType } from "../../../application";
import { buildCsv } from "../../../util";

const CSV_HEADERS = ["ランキングタイトル", "順位", "項目名", "メモ"];

/**
 * ランキングCSVエクスポート レスポンスDTO
 */
export class GetMyRankingExportResponseDto {
  private readonly _value: string;

  constructor(rankings: MyRankingExportResultType[]) {
    const rows = rankings.flatMap((ranking) =>
      ranking.items.map((item) => [
        ranking.ranking.title,
        String(item.order),
        item.itemName ?? "",
        item.itemMemo ?? "",
      ])
    );
    this._value = buildCsv(CSV_HEADERS, rows);
  }

  get value(): string {
    return this._value;
  }
}
