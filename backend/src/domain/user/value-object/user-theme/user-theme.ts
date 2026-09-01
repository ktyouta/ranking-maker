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

    private constructor(theme: string) {

        if (!UserTheme.VALUES.includes(theme)) {
            throw new Error(`テーマが不正です。value:${theme}`);
        }

        this._value = theme;
    }

    get value(): string {
        return this._value;
    }

    /**
     * 既存のテーマ値からインスタンスを生成
     * @param theme テーマ値
     */
    static of(theme: string): UserTheme {
        return new UserTheme(theme);
    }

    /**
     * 新規ユーザー作成時のデフォルトテーマを生成
     */
    static default(): UserTheme {
        return new UserTheme(UserTheme.LAVENDER);
    }
}
