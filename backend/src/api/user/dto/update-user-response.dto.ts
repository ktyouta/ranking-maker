export type UpdateUserResponseType = {
  user: {
    id: string;
    name: string;
    birthday: string;
  };
};

export class UpdateUserResponseDto {
  private readonly _value: UpdateUserResponseType;

  constructor(userId: string, userName: string, birthday: string) {
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
