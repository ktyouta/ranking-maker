import { UserId, UserName, UserBirthday, UserTheme } from "../value-object";

/**
 * ユーザーエンティティ
 */
export class UserEntity {
  private readonly _userId: UserId;
  private readonly _userName: UserName;
  private readonly _userBirthday: UserBirthday;
  private readonly _theme: UserTheme;

  constructor(userId: UserId, userName: UserName, userBirthday: UserBirthday, theme: UserTheme) {
    this._userId = userId;
    this._userName = userName;
    this._userBirthday = userBirthday;
    this._theme = theme;
  }

  get userId(): string {
    return this._userId.value;
  }

  get userName(): string {
    return this._userName.value;
  }

  get userBirthday(): string {
    return this._userBirthday.value;
  }

  get userTheme(): string {
    return this._theme.value;
  }
}
