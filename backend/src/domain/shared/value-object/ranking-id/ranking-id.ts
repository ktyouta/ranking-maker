import { ulid } from "ulid";

/**
 * ランキングID（ULID）
 */
export class RankingId {
  private readonly _value: string;

  private constructor(rankingId: string) {
    if (!rankingId) {
      throw new Error("ランキングIDが設定されていません。");
    }
    this._value = rankingId;
  }

  get value(): string {
    return this._value;
  }

  /**
   * ULIDでランキングIDを生成
   */
  static generate(): RankingId {
    return new RankingId(ulid());
  }

  /**
   * 既存のランキングIDからインスタンスを生成
   * @param rankingId ランキングID
   */
  static of(rankingId: string): RankingId {
    return new RankingId(rankingId);
  }
}
