import { createCtx } from '@/utils/create-ctx';
import { ReactNode, useEffect, useState } from 'react';

const THEME_STORAGE_KEY = 'rm-theme';

export type ThemeType = 'teal' | 'lavender' | 'peach' | 'dark';

// テーマ状態
export const ThemeContext = createCtx<ThemeType>();
// テーマ状態(setter)
export const SetThemeContext = createCtx<React.Dispatch<React.SetStateAction<ThemeType>>>();

type PropsType = {
    children: ReactNode;
};

/**
 * ThemeType の値かどうかを判定する
 */
export function isThemeType(value: string | null): value is ThemeType {
    return value === 'teal' || value === 'lavender' || value === 'peach' || value === 'dark';
}

/**
 * localStorage からテーマ初期値を取得
 */
function getInitialTheme(): ThemeType {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeType(stored) ? stored : 'lavender';
}

export function ThemeProvider(props: PropsType) {

    // テーマ状態
    const [theme, setTheme] = useState<ThemeType>(getInitialTheme);

    // 各コンポーネントで data-theme 別のクラスを持たせなくて済むよう、切り替え箇所を <html> 1箇所に集約する
    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={theme}>
            <SetThemeContext.Provider value={setTheme}>
                {props.children}
            </SetThemeContext.Provider>
        </ThemeContext.Provider>
    );
}
