import type { RefreshToken } from "../../../domain/auth";
import type { UserEntity } from "../../../domain/user";

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

  constructor(entity: UserEntity, refreshToken: RefreshToken) {
    this._value = {
      refreshToken: refreshToken.value,
      user: {
        id: entity.userId,
        name: entity.userName,
        birthday: entity.userBirthday,
        theme: entity.userTheme,
      },
    };
  }

  get value(): UpdateUserResultType {
    return this._value;
  }
}
