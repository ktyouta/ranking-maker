
/**
 * 項目名
 */
export class ItemName {
  static readonly MAX_LENGTH = 100;
  private readonly _value: string | null;

  constructor(itemName: string | null) {
    const trimmed = itemName?.trim() ?? "";
    if (!trimmed) {
      this._value = null;
      return;
    }
    if (trimmed.length > ItemName.MAX_LENGTH) {
      throw new Error(`項目名は${ItemName.MAX_LENGTH}文字以内で入力してください。`);
    }
    this._value = trimmed;
  }

  get value(): string | null {
    return this._value;
  }
}
