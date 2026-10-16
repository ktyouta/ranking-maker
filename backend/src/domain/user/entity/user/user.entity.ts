import { UserId } from "../../../shared";
import { UserBirthday, UserName, UserTheme } from "../../value-object";

/**
 * ユーザーエンティティ
 */
export class UserEntity {
  private readonly _userId: UserId;
  private _userName: UserName;
  private _userBirthday: UserBirthday;
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

  /**
   * プロフィール（ユーザー名・生年月日）を変更する
   * @param userName 変更後のユーザー名
   * @param userBirthday 変更後の生年月日
   */
  changeProfile(userName: UserName, userBirthday: UserBirthday) {
    this._userName = userName;
    this._userBirthday = userBirthday;
  }
}
