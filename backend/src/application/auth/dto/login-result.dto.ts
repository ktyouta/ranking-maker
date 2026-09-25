import type { AccessToken, RefreshToken } from "../../../domain/auth";
import type { UserProfile } from "../../../domain/user";

export type LoginResultType = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    birthday: string | null;
    theme: string;
  };
};

/**
 * ログイン結果 DTO
 */
export class LoginResultDto {
  private readonly _value: LoginResultType;

  constructor(userInfo: UserProfile, accessToken: AccessToken, refreshToken: RefreshToken) {
    this._value = {
      accessToken: accessToken.token,
      refreshToken: refreshToken.value,
      user: {
        id: userInfo.id,
        name: userInfo.name,
        birthday: userInfo.birthday,
        theme: userInfo.theme,
      },
    };
  }

  get value(): LoginResultType {
    return this._value;
  }
}
