import { err, ok, type Result } from "neverthrow";

/**
 * タグ名の生成失敗
 */
export type TagNameError = { type: "TAG_NAME_EMPTY" }
  | { type: "TAG_NAME_TOO_LONG"; max: number }
  | { type: "TAG_NAME_INVALID_CHARACTER"; separator: string };

/**
 * タグ名
 */
export class TagName {
  static readonly MAX_LENGTH = 20;
  // 複数のタグ名を1つの文字列で表すときの区切り文字。タグ名自体には含められない
  static readonly SEPARATOR = ",";
  private readonly _value: string;

  /**
   * @param tagName 前後の空白を除去済みのタグ名
   */
  private constructor(tagName: string) {
    this._value = tagName;
  }

  get value(): string {
    return this._value;
  }

  /**
   * 外部からの入力値から生成する（前後の空白は除去する）
   * @param tagName タグ名
   * @returns 成功時はタグ名、空・上限文字数超過・区切り文字を含む場合はその内容を持つ Result
   */
  static create(tagName: string): Result<TagName, TagNameError> {
    const trimmed = tagName.trim();

    if (!trimmed) {
      return err({ type: "TAG_NAME_EMPTY" });
    }

    if (trimmed.length > TagName.MAX_LENGTH) {
      return err({ type: "TAG_NAME_TOO_LONG", max: TagName.MAX_LENGTH });
    }

    if (trimmed.includes(TagName.SEPARATOR)) {
      return err({ type: "TAG_NAME_INVALID_CHARACTER", separator: TagName.SEPARATOR });
    }

    return ok(new TagName(trimmed));
  }

  /**
   * 永続化済みの値など、制約を満たすことが保証された値から生成する
   * @param tagName タグ名
   * @returns タグ名
   * @throws 制約を満たさない場合（呼び出し側の不具合）
   */
  static of(tagName: string): TagName {
    return TagName.create(tagName).match(
      (name) => name,
      (error) => { throw new Error(`タグ名が不正です。type:${error.type}`); },
    );
  }
}
