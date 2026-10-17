import { err, ok, Result } from "neverthrow";
import { UserId } from "../../../shared";
import { LoginCredentialId, LoginId, NewPassword, Pepper, RawPassword, UserBirthday, UserName, UserPassword, UserSalt, UserTheme } from "../../value-object";

type CreateUserParamType = {
    name: UserName;
    birthday: UserBirthday;
    password: NewPassword;
    pepper: Pepper;
};

type UpdateUserParamType = {
    name: UserName;
    birthday: UserBirthday;
};

type UpdateThemeParamType = {
    theme: UserTheme;
};

type UserReconstructParamType = {
    id: string;
    name: string;
    birthday: string;
    theme: string;
    loginCredentialId: string;
    loginId: string;
    passwordHash: string;
    salt: string;
    deleteFlg: boolean;
};

type UserSnapshotType = {
    id: string;
    name: string;
    birthday: string;
    theme: string;
    loginCredentialId: string;
    loginId: string;
    passwordHash: string;
    salt: string;
    deleteFlg: boolean;
}

export type UserValidationError = { type: "CURRENT_PASSWORD_MISMATCH"; };

export class UserAggregate {

    private constructor(private readonly _userId: UserId,
        private _userName: UserName,
        private _birthday: UserBirthday,
        private _theme: UserTheme,
        private readonly _loginCredentialId: LoginCredentialId,
        private _loginId: LoginId,
        private _password: UserPassword,
        private readonly _salt: UserSalt,
        private _deleteFlg: boolean,
    ) { }

    get id() {
        return this._userId;
    }

    get name() {
        return this._userName;
    }

    get birthday() {
        return this._birthday;
    }

    get theme() {
        return this._theme;
    }

    get password() {
        return this._password;
    }

    get salt() {
        return this._salt;
    }

    /**
     * ユーザーを作成
     */
    static async create(params: CreateUserParamType) {
        const salt = UserSalt.create();
        const password = await UserPassword.hash(params.password, salt, params.pepper);

        return new UserAggregate(
            UserId.create(),
            params.name,
            params.birthday,
            UserTheme.default(),
            LoginCredentialId.create(),
            LoginId.of(params.name.value),
            password,
            salt,
            false
        );
    }

    /**
     * 永続化済みの値からユーザーを復元する
     * @param params 
     * @returns 
     */
    static reconstruct(params: UserReconstructParamType): UserAggregate {
        return new UserAggregate(
            UserId.of(params.id),
            UserName.of(params.name),
            UserBirthday.of(params.birthday),
            UserTheme.of(params.theme),
            LoginCredentialId.of(params.loginCredentialId),
            LoginId.of(params.loginId),
            UserPassword.of(params.passwordHash),
            UserSalt.of(params.salt),
            params.deleteFlg
        );
    }

    /**
     * ユーザー情報を更新
     * @param params 
     */
    updateUser(params: UpdateUserParamType) {
        if (this._deleteFlg) {
            throw new Error(`削除済みのユーザーのためユーザー情報を更新できません。ID:${this._userId.value}`);
        }

        this._userName = params.name;
        this._birthday = params.birthday;
        this._loginId = LoginId.of(params.name.value);
    }

    /**
     * テーマを更新
     * @param params 
     */
    updateTheme(params: UpdateThemeParamType) {
        if (this._deleteFlg) {
            throw new Error(`削除済みのユーザーのためテーマを更新できません。ID:${this._userId.value}`);
        }

        this._theme = params.theme;
    }

    /**
     * パスワード変更
     * @param newPassword 
     * @param pepper 
     * @returns 
     */
    async changePassword(nowPassword: RawPassword, newPassword: NewPassword, pepper: Pepper): Promise<Result<undefined, UserValidationError>> {
        if (this._deleteFlg) {
            throw new Error(`削除済みのユーザーのためパスワードを変更できません。ID:${this._userId.value}`);
        }

        // パスワードチェック
        const nowHashedPassword = await UserPassword.hash(nowPassword, this.salt, pepper);
        if (!nowHashedPassword.equals(this.password)) {
            return err({ type: "CURRENT_PASSWORD_MISMATCH" });
        }

        const newHashedPassword = await UserPassword.hash(newPassword, this.salt, pepper);
        this._password = newHashedPassword;
        return ok(undefined);
    }

    /**
     * ユーザー削除
     */
    delete() {
        if (this._deleteFlg) {
            throw new Error(`既に削除されたユーザーです。ID:${this._userId.value}`);
        }
        this._deleteFlg = true;
    }

    /**
     * スナップショット作成
     */
    toSnapshot(): UserSnapshotType {
        return {
            id: this._userId.value,
            name: this._userName.value,
            birthday: this._birthday.value,
            theme: this._theme.value,
            loginCredentialId: this._loginCredentialId.value,
            loginId: this._loginId.value,
            passwordHash: this._password.value,
            salt: this._salt.value,
            deleteFlg: this._deleteFlg,
        };
    }
}