import type { RefreshToken } from "../../../../domain/auth";
import type { UserAggregate } from "../../../../domain/user";

export type UpdateUserResultType = {
  refreshToken: string;
  user: {
    id: string;
    name: string;
    birthday: string;
    theme: string;
  };
};

/**
 * ユーザー更新結果 DTO
 */
export class UpdateUserResultDto {
  private readonly _value: UpdateUserResultType;

  constructor(aggregate: UserAggregate, refreshToken: RefreshToken) {
    this._value = {
      refreshToken: refreshToken.value,
      user: {
        id: aggregate.id.value,
        name: aggregate.name.value,
        birthday: aggregate.birthday.value,
        theme: aggregate.theme.value,
      },
    };
  }

  get value(): UpdateUserResultType {
    return this._value;
  }
}
