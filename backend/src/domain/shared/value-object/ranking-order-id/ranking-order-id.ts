import { ulid } from "ulid";

/**
 * ランキングオーダーID（ULID）
 */
export class RankingOrderId {
  private readonly _value: string;

  private constructor(rankingId: string) {
    if (!rankingId) {
      throw new Error("ランキングオーダーIDが設定されていません。");
    }
    this._value = rankingId;
  }

  get value(): string {
    return this._value;
  }

  /**
   * ULIDでランキングオーダーIDを生成
   */
  static generate(): RankingOrderId {
    return new RankingOrderId(ulid());
  }

  /**
   * 既存のランキングオーダーIDからインスタンスを生成
   * @param rankingId ランキングオーダーID
   */
  static of(rankingOrderId: string): RankingOrderId {
    return new RankingOrderId(rankingOrderId);
  }
}
