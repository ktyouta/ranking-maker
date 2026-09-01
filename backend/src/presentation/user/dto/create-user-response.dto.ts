import type { UserEntity } from "../../../domain";

export type CreateUserResponseType = {
  accessToken: string;
  user: {
    id: string;
    name: string;
    birthday: string;
    theme: string;
  };
};

export class CreateUserResponseDto {
  private readonly _value: CreateUserResponseType;

  constructor(entity: UserEntity, accessToken: string) {
    this._value = {
      accessToken,
      user: {
        id: entity.userId,
        name: entity.userName,
        birthday: entity.userBirthday,
        theme: entity.userTheme,
      },
    };
  }

  get value(): CreateUserResponseType {
    return this._value;
  }
}
