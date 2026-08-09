
// 最大入力可能数
const MAX_LENGTH = 1000;

/**
 * ランキングメモ
 */
export class ItemMemo {
  private readonly _value: string | null;

  constructor(itemMemo: string) {
    if (itemMemo.length > MAX_LENGTH) {
      throw new Error(`ItemMemoの最大入力数を超えています。`);
    }
    this._value = itemMemo;
  }

  get value() {
    return this._value;
  }
}
