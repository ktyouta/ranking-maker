
/**
 * ランキング名
 */
export class ItemName {
  private readonly _value: string;

  constructor(itemName: string) {
    if (!itemName) {
      throw new Error(`ランキング名が存在しません。`);
    }
    this._value = itemName;
  }

  get value(): string {
    return this._value;
  }
}
