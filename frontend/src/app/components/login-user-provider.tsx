import { paths } from "@/config/paths";
import { registerResetLogin } from "@/stores/access-token-store";
import { createCtx } from "@/utils/create-ctx";
import { useQueryClient } from "@tanstack/react-query";
import { isThemeType } from "@/constants/theme";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type LoginUserType } from "../api/verify";
import { SetThemeContext } from "./theme-provider";

// ログインユーザー情報
export const LoginUserContext = createCtx<LoginUserType | null>();
// ログインユーザー情報(setter)
export const SetLoginUserContext = createCtx<React.Dispatch<React.SetStateAction<LoginUserType | null>>>();

type PropsType = {
    children: ReactNode;
    loginUser: LoginUserType | null;
}

export function LoginUserProvider(props: PropsType) {

    // ログインユーザー情報
    const [loginUser, setLoginUser] = useState<LoginUserType | null>(props.loginUser);
    // ルーティング用
    const navigate = useNavigate();
    // QueryClientインスタンス
    const queryClient = useQueryClient();
    // テーマ状態(setter)
    const setTheme = SetThemeContext.useCtx();

    /**
     * ログイン画面に遷移
     */
    const moveLogin = useCallback(() => {
        navigate(paths.login.path);
    }, [navigate]);

    /**
     * ユーザー情報をリセット
     * 別ユーザーのログイン時に前ユーザーのキャッシュが表示されないよう、全キャッシュをクリアする
     */
    const resetUser = useCallback(() => {
        setLoginUser(null);
        queryClient.clear();
    }, [queryClient]);

    // ログインリセット処理を登録（登録は上書きのため、依存が変わった場合は最新の処理で登録し直す）
    useEffect(() => {
        registerResetLogin({
            resetUser,
            moveLogin,
        });
    }, [resetUser, moveLogin]);

    // ログインユーザーのテーマ設定をThemeContextに反映
    const theme = loginUser?.theme;
    useEffect(() => {
        if (theme !== undefined && isThemeType(theme)) {
            setTheme(theme);
        }
    }, [theme, setTheme]);

    return (
        <LoginUserContext.Provider value={loginUser}>
            <SetLoginUserContext.Provider value={setLoginUser}>
                {props.children}
            </SetLoginUserContext.Provider>
        </LoginUserContext.Provider>
    );
}
