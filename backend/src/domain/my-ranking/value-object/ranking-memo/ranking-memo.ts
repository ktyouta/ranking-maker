import { err, ok, type Result } from "neverthrow";

/**
 * ランキングメモの生成失敗
 */
export type RankingMemoError = { type: "RANKING_MEMO_TOO_LONG"; max: number };

/**
 * ランキングメモ
 */
export class RankingMemo {
  /** 最大文字数（UTF-16 コード単位。通常の日本語は 1文字=1、絵文字等は 2 でカウント） */
  static readonly MAX_LENGTH = 1000;

  private readonly _value: string | null;

  /**
   * @param rankingMemo 上限文字数以内のランキングメモ
   */
  private constructor(rankingMemo: string | null) {
    this._value = rankingMemo;
  }

  get value() {
    return this._value;
  }

  /**
   * 外部からの入力値から生成する
   * @param rankingMemo ランキングメモ
   * @returns 成功時はランキングメモ、上限文字数超過の場合はその内容を持つ Result
   */
  static create(rankingMemo: string | null): Result<RankingMemo, RankingMemoError> {
    if (rankingMemo && rankingMemo.length > RankingMemo.MAX_LENGTH) {
      return err({ type: "RANKING_MEMO_TOO_LONG", max: RankingMemo.MAX_LENGTH });
    }

    return ok(new RankingMemo(rankingMemo));
  }

  /**
   * 永続化済みの値など、制約を満たすことが保証された値から生成する
   * @param rankingMemo ランキングメモ
   * @returns ランキングメモ
   * @throws 制約を満たさない場合（呼び出し側の不具合）
   */
  static of(rankingMemo: string | null): RankingMemo {
    return RankingMemo.create(rankingMemo).match(
      (memo) => memo,
      (error) => { throw new Error(`ランキングメモが不正です。type:${error.type}`); },
    );
  }
}
