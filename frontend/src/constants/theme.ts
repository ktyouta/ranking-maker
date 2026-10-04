/**
 * 選択できるテーマ
 */
export type ThemeType = 'teal' | 'lavender' | 'peach' | 'dark';

/**
 * ThemeType の値かどうかを判定する
 * @param value 判定する値
 * @returns ThemeType の値であれば true
 */
export function isThemeType(value: string | null): value is ThemeType {
    return value === 'teal' || value === 'lavender' || value === 'peach' || value === 'dark';
}
