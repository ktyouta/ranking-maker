
/**
 * 項目名
 */
export class ItemName {
  static readonly MAX_LENGTH = 100;
  private readonly _value: string;

  constructor(itemName: string) {
    const trimmed = itemName.trim();
    if (!trimmed) {
      throw new Error(`項目名が存在しません。`);
    }
    if (trimmed.length > ItemName.MAX_LENGTH) {
      throw new Error(`項目名は${ItemName.MAX_LENGTH}文字以内で入力してください。`);
    }
    this._value = trimmed;
  }

  get value(): string {
    return this._value;
  }
}
