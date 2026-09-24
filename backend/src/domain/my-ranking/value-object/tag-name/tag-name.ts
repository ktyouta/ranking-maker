
/**
 * タグ名
 */
export class TagName {
  static readonly MAX_LENGTH = 20;
  private readonly _value: string;

  constructor(tagName: string) {
    const trimmed = tagName?.trim() ?? "";
    if (!trimmed) {
      throw new Error(`タグ名が入力されていません。`);
    }
    if (trimmed.length > TagName.MAX_LENGTH) {
      throw new Error(`タグ名は${TagName.MAX_LENGTH}文字以内で入力してください。`);
    }
    this._value = trimmed;
  }

  get value(): string {
    return this._value;
  }
}
