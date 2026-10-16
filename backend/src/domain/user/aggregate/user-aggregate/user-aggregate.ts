import type { UserId } from "../../../shared";
import type { LoginCredentialId, LoginId, UserBirthday, UserName, UserPassword, UserSalt, UserTheme } from "../../value-object";

export class UserAggregate {

    private constructor(private readonly _userId: UserId,
        private readonly _userName: UserName,
        private readonly _birthday: UserBirthday,
        private readonly _thema: UserTheme,
        private readonly _deleteFlg: boolean,
        private readonly _loginCredentialId: LoginCredentialId,
        private readonly _passwordHash: UserPassword,
        private readonly _loginId: LoginId,
        private readonly _salt: UserSalt,
    ) { }

    static create() {

    }
}