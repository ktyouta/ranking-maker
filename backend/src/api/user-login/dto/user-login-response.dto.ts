import type { UserMaster } from "../../../infrastructure/db";

export type UserLoginResponseType = {
  accessToken: string;
  user: {
    id: string;
    name: string;
    birthday: string;
  };
};

export class UserLoginResponseDto {
  private readonly _value: UserLoginResponseType;

  constructor(userInfo: UserMaster, accessToken: string) {
    this._value = {
      accessToken,
      user: {
        id: userInfo.id,
        name: userInfo.name,
        birthday: userInfo.birthday,
      },
    };
  }

  get value(): UserLoginResponseType {
    return this._value;
  }
}
