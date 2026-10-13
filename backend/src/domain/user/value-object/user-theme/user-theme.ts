import { err, ok, type Result } from "neverthrow";

/**
 * ユーザーテーマの生成失敗
 */
export type UserThemeError = { type: "USER_THEME_INVALID" };

/**
 * ユーザーテーマ
 */
export class UserTheme {

    static readonly LAVENDER = "lavender";
    static readonly TEAL = "teal";
    static readonly PEACH = "peach";
    static readonly DARK = "dark";
    static readonly VALUES: readonly string[] = [UserTheme.LAVENDER, UserTheme.TEAL, UserTheme.PEACH, UserTheme.DARK];

    private readonly _value: string;

    /**
     * @param theme 許容値のテーマ値
     */
    private constructor(theme: string) {
        this._value = theme;
    }

    get value(): string {
        return this._value;
    }

    /**
     * 外部からの入力値から生成する
     * @param theme テーマ値
     * @returns 成功時はテーマ、許容値以外の場合はその内容を持つ Result
     */
    static create(theme: string): Result<UserTheme, UserThemeError> {
        if (!UserTheme.VALUES.includes(theme)) {
            return err({ type: "USER_THEME_INVALID" });
        }

        return ok(new UserTheme(theme));
    }

    /**
     * 既存のテーマ値からインスタンスを生成
     * @param theme テーマ値
     * @returns テーマ
     * @throws 許容値以外の場合（呼び出し側の不具合）
     */
    static of(theme: string): UserTheme {
        return UserTheme.create(theme).match(
            (value) => value,
            (error) => { throw new Error(`テーマが不正です。type:${error.type} value:${theme}`); },
        );
    }

    /**
     * 新規ユーザー作成時のデフォルトテーマを生成
     */
    static default(): UserTheme {
        return new UserTheme(UserTheme.LAVENDER);
    }
}
