import { err, ok, type Result } from "neverthrow";

/**
 * ログインIDの生成失敗
 */
export type LoginIdError = { type: "LOGIN_ID_EMPTY" };

/**
 * ログインID（ログイン時に入力するユーザー名。ユーザー名の文字数の制約は適用しない）
 */
export class LoginId {
  private readonly _value: string;

  /**
   * @param loginId 空でないユーザー名
   */
  private constructor(loginId: string) {
    this._value = loginId;
  }

  get value(): string {
    return this._value;
  }

  /**
   * 外部からの入力値から生成する
   * @param loginId ユーザー名
   * @returns 成功時はログインID、空の場合はその内容を持つ Result
   */
  static create(loginId: string): Result<LoginId, LoginIdError> {
    if (!loginId) {
      return err({ type: "LOGIN_ID_EMPTY" });
    }

    return ok(new LoginId(loginId));
  }
}
