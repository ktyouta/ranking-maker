export type UpdateUserResponseType = {
  user: {
    id: string;
    name: string;
    birthday: string | null;
  };
};

export class UpdateUserResponseDto {
  private readonly _value: UpdateUserResponseType;

  constructor(userId: string, userName: string, birthday: string | null) {
    this._value = {
      user: {
        id: userId,
        name: userName,
        birthday,
      },
    };
  }

  get value(): UpdateUserResponseType {
    return this._value;
  }
}
