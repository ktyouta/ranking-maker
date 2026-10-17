import { err, ok, type Result } from "neverthrow";
import { ulid } from "ulid";

/**
 * ランキングIDの生成失敗
 */
export type RankingIdError = { type: "RANKING_ID_EMPTY" };

/**
 * ランキングID（ULID）
 */
export class RankingId {
  private readonly _value: string;

  /**
   * @param rankingId 空でないランキングID
   */
  private constructor(rankingId: string) {
    this._value = rankingId;
  }

  get value(): string {
    return this._value;
  }

  /**
   * ULIDでランキングIDを生成
   */
  static create(): RankingId {
    return new RankingId(ulid());
  }

  /**
   * 外部からの入力値から生成する
   * @param rankingId ランキングID
   * @returns 成功時はランキングID、空の場合はその内容を持つ Result
   */
  static fromInput(rankingId: string): Result<RankingId, RankingIdError> {
    if (!rankingId) {
      return err({ type: "RANKING_ID_EMPTY" });
    }

    return ok(new RankingId(rankingId));
  }

  /**
   * 既存のランキングIDからインスタンスを生成
   * @param rankingId ランキングID
   * @returns ランキングID
   * @throws 空の場合（呼び出し側の不具合）
   */
  static of(rankingId: string): RankingId {
    return RankingId.fromInput(rankingId).match(
      (value) => value,
      (error) => { throw new Error(`ランキングIDが不正です。type:${error.type}`); },
    );
  }
}
