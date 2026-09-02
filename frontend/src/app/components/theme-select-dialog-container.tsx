import { useUpdateUserThemeMutation } from '@/app/api/update-user-theme';
import { ThemeSelectDialog } from '@/components/layouts/theme-select-dialog/theme-select-dialog';
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { LoginUserContext, SetLoginUserContext } from './login-user-provider';
import { SetThemeContext, ThemeContext, ThemeType } from './theme-provider';

type PropsType = {
    isOpen: boolean;
    onClose: () => void;
};

export function ThemeSelectDialogContainer(props: PropsType) {

    // テーマ状態
    const theme = ThemeContext.useCtx();
    // テーマ状態(setter)
    const setTheme = SetThemeContext.useCtx();
    // ログインユーザー情報
    const loginUser = LoginUserContext.useCtx();
    // ログインユーザー情報(setter)
    const setLoginUserInfo = SetLoginUserContext.useCtx();
    // テーマ更新リクエスト
    const updateThemeMutation = useUpdateUserThemeMutation();

    /**
     * テーマ選択
     * @param next 選択されたテーマ
     */
    const handleSelect = useCallback((next: ThemeType) => {
        const previousTheme = theme;
        setTheme(next);

        if (!loginUser) {
            return;
        }

        updateThemeMutation.mutate(
            {
                json: { theme: next },
            },
            {
                onSuccess: () => { setLoginUserInfo((prev) => (prev ? { ...prev, theme: next } : prev)); },
                onError: (error: unknown) => {
                    setTheme(previousTheme);
                    if (error instanceof Error) {
                        toast.error(error.message);
                    }
                    else {
                        toast.error("テーマを更新できませんでした。");
                    }
                }
            }
        );
    }, [loginUser, setTheme, setLoginUserInfo, updateThemeMutation]);

    return (
        <ThemeSelectDialog
            isOpen={props.isOpen}
            onClose={props.onClose}
            theme={theme}
            onSelect={handleSelect}
        />
    );
}
