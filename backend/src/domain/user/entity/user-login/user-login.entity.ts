import { err, ok, type Result } from "neverthrow";
import type { UserId } from "../../../shared";
import type { NewPassword, Pepper, RawPassword, UserName, UserSalt } from "../../value-object";
import { UserPassword } from "../../value-object";

/**
 * パスワード変更時のエラー
 */
export type PasswordChangeError = { type: "CURRENT_PASSWORD_MISMATCH" };

/**
 * ユーザーログインエンティティ
 */
export class UserLoginEntity {
  private readonly _loginCredentialId: UserId; // ログインレコード自身のID（ULID）
  private readonly _userId: UserId;  // user_master.id（FK）
  private readonly _loginId: UserName;
  private _passwordHash: UserPassword;
  private readonly _salt: UserSalt;

  constructor(
    loginCredentialId: UserId,
    userId: UserId,
    loginId: UserName,
    passwordHash: UserPassword,
    salt: UserSalt
  ) {
    this._loginCredentialId = loginCredentialId;
    this._userId = userId;
    this._loginId = loginId;
    this._passwordHash = passwordHash;
    this._salt = salt;
  }

  get loginCredentialId(): string {
    return this._loginCredentialId.value;
  }

  get userId(): string {
    return this._userId.value;
  }

  get loginId(): string {
    return this._loginId.value;
  }

  get passwordHash(): string {
    return this._passwordHash.value;
  }

  get salt(): string {
    return this._salt.value;
  }

  /**
   * 入力パスワードが登録済みパスワードと一致するか検証する
   * @param rawPassword 照合用のパスワード（平文）
   * @param pepper ペッパー
   * @returns 一致する場合は true
   */
  async verifyPassword(rawPassword: RawPassword, pepper: Pepper): Promise<boolean> {
    const hashed = await UserPassword.hash(rawPassword.value, this._salt, pepper);
    return hashed.equals(this._passwordHash);
  }

  /**
   * パスワードを変更する
   * 現在のパスワードが一致する場合のみ、登録時と同じソルトでハッシュ化した新しいパスワードに置き換える
   * @param currentPassword 照合用の現在のパスワード（平文）
   * @param newPassword 新しく設定するパスワード
   * @param pepper ペッパー
   * @returns 変更成功時は ok、現在のパスワードが一致しない場合は CURRENT_PASSWORD_MISMATCH（変更しない）
   */
  async changePassword(currentPassword: RawPassword, newPassword: NewPassword, pepper: Pepper): Promise<Result<void, PasswordChangeError>> {
    if (!(await this.verifyPassword(currentPassword, pepper))) {
      return err({ type: "CURRENT_PASSWORD_MISMATCH" });
    }
    this._passwordHash = await UserPassword.hash(newPassword.value, this._salt, pepper);
    return ok(undefined);
  }
}
