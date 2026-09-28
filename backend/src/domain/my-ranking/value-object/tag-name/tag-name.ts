
/**
 * タグ名
 */
export class TagName {
  static readonly MAX_LENGTH = 20;
  // 複数のタグ名を1つの文字列で表すときの区切り文字。タグ名自体には含められない
  static readonly SEPARATOR = ",";
  private readonly _value: string;

  constructor(tagName: string) {
    const trimmed = tagName?.trim() ?? "";
    if (!trimmed) {
      throw new Error(`タグ名が入力されていません。`);
    }
    if (trimmed.length > TagName.MAX_LENGTH) {
      throw new Error(`タグ名は${TagName.MAX_LENGTH}文字以内で入力してください。`);
    }
    if (trimmed.includes(TagName.SEPARATOR)) {
      throw new Error(`タグ名に「${TagName.SEPARATOR}」は使えません。`);
    }
    this._value = trimmed;
  }

  get value(): string {
    return this._value;
  }
}
