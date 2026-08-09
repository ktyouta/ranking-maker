
// 最大入力可能数
const MAX_LENGTH = 1000;

/**
 * ランキングメモ
 */
export class RankingMemo {
  private readonly _value: string | null;

  constructor(rankingMemo: string) {
    if (rankingMemo.length > MAX_LENGTH) {
      throw new Error(`rankingMemoの最大入力数を超えています。`);
    }
    this._value = rankingMemo;
  }

  get value() {
    return this._value;
  }
}
