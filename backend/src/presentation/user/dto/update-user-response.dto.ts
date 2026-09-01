export type UpdateUserResponseType = {
  user: {
    id: string;
    name: string;
    birthday: string | null;
    theme: string;
  };
};

export class UpdateUserResponseDto {
  private readonly _value: UpdateUserResponseType;

  constructor(userId: string, userName: string, birthday: string | null, theme: string) {
    this._value = {
      user: {
        id: userId,
        name: userName,
        birthday,
        theme,
      },
    };
  }

  get value(): UpdateUserResponseType {
    return this._value;
  }
}
