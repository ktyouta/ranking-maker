import type { AccessToken, RefreshToken } from "../../../domain/auth";
import type { UserEntity } from "../../../domain/user";

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

  constructor(entity: UserEntity, accessToken: AccessToken, refreshToken: RefreshToken) {
    this._value = {
      accessToken: accessToken.token,
      refreshToken: refreshToken.value,
      user: {
        id: entity.userId,
        name: entity.userName,
        birthday: entity.userBirthday,
        theme: entity.userTheme,
      },
    };
  }

  get value(): CreateUserResultType {
    return this._value;
  }
}
