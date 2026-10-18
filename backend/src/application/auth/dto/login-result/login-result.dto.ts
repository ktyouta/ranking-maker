import type { AccessToken, RefreshToken } from "../../../../domain/auth";
import type { UserAggregate } from "../../../../domain/user";

export type LoginResultType = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    birthday: string;
    theme: string;
  };
};

/**
 * ログイン結果 DTO
 */
export class LoginResultDto {
  private readonly _value: LoginResultType;

  constructor(aggregate: UserAggregate, accessToken: AccessToken, refreshToken: RefreshToken) {
    this._value = {
      accessToken: accessToken.token,
      refreshToken: refreshToken.value,
      user: {
        id: aggregate.id.value,
        name: aggregate.name.value,
        birthday: aggregate.birthday.value,
        theme: aggregate.theme.value,
      },
    };
  }

  get value(): LoginResultType {
    return this._value;
  }
}
