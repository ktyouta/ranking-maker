import { UserId, UserName, UserPassword, UserSalt } from "../../../domain";

/**
 * ユーザーログインエンティティ
 */
export class UserLoginEntity {
  private readonly _loginId: UserId; // ログインレコード自身のID（ULID）
  private readonly _userId: UserId;  // user_master.id（FK）
  private readonly _loginName: UserName;
  private readonly _passwordHash: UserPassword;
  private readonly _salt: UserSalt;

  constructor(
    loginId: UserId,
    userId: UserId,
    loginName: UserName,
    passwordHash: UserPassword,
    salt: UserSalt
  ) {
    this._loginId = loginId;
    this._userId = userId;
    this._loginName = loginName;
    this._passwordHash = passwordHash;
    this._salt = salt;
  }

  get loginId(): string {
    return this._loginId.value;
  }

  get userId(): string {
    return this._userId.value;
  }

  get loginName(): string {
    return this._loginName.value;
  }

  get passwordHash(): string {
    return this._passwordHash.value;
  }

  get salt(): string {
    return this._salt.value;
  }
}
