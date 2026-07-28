import { paths } from "@/config/paths";
import { registerResetLogin } from "@/stores/access-token-store";
import { createCtx } from "@/utils/create-ctx";
import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginUserType } from "../api/verify";

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

    /**
     * ログイン画面に遷移
     */
    function moveLogin() {
        navigate(paths.login.getHref(window.location.pathname));
    }

    /**
     * ユーザー情報をリセット
     */
    function resetUser() {
        setLoginUser(null);
    }

    // ログインリセット処理を登録
    useEffect(() => {
        registerResetLogin({
            resetUser,
            moveLogin,
        });
    }, []);

    return (
        <LoginUserContext.Provider value={loginUser}>
            <SetLoginUserContext.Provider value={setLoginUser}>
                {props.children}
            </SetLoginUserContext.Provider>
        </LoginUserContext.Provider>
    );
}
