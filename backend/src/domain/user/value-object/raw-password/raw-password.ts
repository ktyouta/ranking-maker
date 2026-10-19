import { err, ok, type Result } from "neverthrow";

/**
 * 平文のパスワードの生成失敗
 */
export type RawPasswordError = { type: "RAW_PASSWORD_EMPTY" };

/**
 * 平文のパスワード（ハッシュ化前の値。パスワードの方針は適用しない）
 */
export class RawPassword {
  private readonly _value: string;

  /**
   * @param rawPassword 空でない平文のパスワード
   */
  private constructor(rawPassword: string) {
    this._value = rawPassword;
  }

  get value(): string {
    return this._value;
  }

  /**
   * 外部からの入力値から生成する
   * @param rawPassword 平文のパスワード
   * @returns 成功時は平文のパスワード、空の場合はその内容を持つ Result
   */
  static create(rawPassword: string): Result<RawPassword, RawPasswordError> {
    if (!rawPassword) {
      return err({ type: "RAW_PASSWORD_EMPTY" });
    }

    return ok(new RawPassword(rawPassword));
  }
}
