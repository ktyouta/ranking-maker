import { UserEntity } from "../entity";

export type CreateUserResponseType = {
  accessToken: string;
  user: {
    id: string;
    name: string;
    birthday: string;
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
      },
    };
  }

  get value(): CreateUserResponseType {
    return this._value;
  }
}
