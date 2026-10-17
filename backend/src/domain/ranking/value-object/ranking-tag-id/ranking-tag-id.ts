import { ulid } from "ulid";

/**
 * ランキングタグID（ULID）
 */
export class RankingTagId {
  private readonly _value: string;

  private constructor(rankingTagId: string) {
    if (!rankingTagId) {
      throw new Error("ランキングタグIDが設定されていません。");
    }
    this._value = rankingTagId;
  }

  get value(): string {
    return this._value;
  }

  /**
   * ULIDでランキングタグIDを生成
   */
  static generate(): RankingTagId {
    return new RankingTagId(ulid());
  }

  /**
   * 既存のランキングタグIDからインスタンスを生成
   * @param rankingTagId ランキングタグID
   */
  static of(rankingTagId: string): RankingTagId {
    return new RankingTagId(rankingTagId);
  }
}
