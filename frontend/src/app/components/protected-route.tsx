import { paths } from "@/config/paths";
import { Navigate, Outlet } from "react-router-dom";
import { LoginUserContext } from "./login-user-provider";


export function ProtectedRoute() {

    // ログインユーザー情報
    const loginUser = LoginUserContext.useCtx();

    if (!loginUser) {
        return (
            <Navigate
                to={paths.login.path}
                replace
            />
        );
    }

    return (
        <Outlet />
    );
}

