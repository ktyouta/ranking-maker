import type { AccessToken } from "../../../domain/auth";
import type { UserProfile } from "../../../domain/user";

export type VerifyResultType = {
  accessToken: string;
  user: {
    id: string;
    name: string;
    birthday: string | null;
    theme: string;
  };
};

/**
 * 認証チェック結果 DTO
 */
export class VerifyResultDto {
  private readonly _value: VerifyResultType;

  constructor(accessToken: AccessToken, userInfo: UserProfile) {
    this._value = {
      accessToken: accessToken.token,
      user: {
        id: userInfo.id,
        name: userInfo.name,
        birthday: userInfo.birthday,
        theme: userInfo.theme,
      },
    };
  }

  get value(): VerifyResultType {
    return this._value;
  }
}
