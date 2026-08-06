
/**
 * ランキングオーダー
 */
export class Order {
  private readonly _value: number;

  constructor(order: number) {
    if (order < 1) {
      throw new Error(`ランキング順位が不正です。order:${order}`);
    }
    this._value = order;
  }

  get value(): number {
    return this._value;
  }
}
