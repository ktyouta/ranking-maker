
/**
 * ランキングメモ
 */
export class RankingMemo {
  /** 最大文字数（UTF-16 コード単位。通常の日本語は 1文字=1、絵文字等は 2 でカウント） */
  static readonly MAX_LENGTH = 1000;

  private readonly _value: string | null;

  constructor(rankingMemo: string | null) {
    if (rankingMemo && rankingMemo.length > RankingMemo.MAX_LENGTH) {
      throw new Error(`ランキングメモは${RankingMemo.MAX_LENGTH}文字以内で入力してください。`);
    }
    this._value = rankingMemo;
  }

  get value() {
    return this._value;
  }
}
