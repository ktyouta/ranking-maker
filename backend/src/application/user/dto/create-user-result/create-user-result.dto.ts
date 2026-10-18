import type { AccessToken, RefreshToken, UserAggregate } from "../../../../domain/user";

export type CreateUserResultType = {
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
 * ユーザー作成結果 DTO
 */
export class CreateUserResultDto {
  private readonly _value: CreateUserResultType;

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

  get value(): CreateUserResultType {
    return this._value;
  }
}
