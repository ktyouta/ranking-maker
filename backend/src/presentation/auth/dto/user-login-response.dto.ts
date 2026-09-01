import type { UserProfile } from "../../../domain";

export type UserLoginResponseType = {
  accessToken: string;
  user: {
    id: string;
    name: string;
    birthday: string | null;
    theme: string;
  };
};

export class UserLoginResponseDto {
  private readonly _value: UserLoginResponseType;

  constructor(userInfo: UserProfile, accessToken: string) {
    this._value = {
      accessToken,
      user: {
        id: userInfo.id,
        name: userInfo.name,
        birthday: userInfo.birthday,
        theme: userInfo.theme,
      },
    };
  }

  get value(): UserLoginResponseType {
    return this._value;
  }
}
