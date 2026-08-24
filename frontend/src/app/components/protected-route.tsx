import { NotFound } from "@/components";
import { Outlet } from "react-router-dom";
import { LoginUserContext } from "./login-user-provider";


export function ProtectedRoute() {

    // ログインユーザー情報
    const loginUser = LoginUserContext.useCtx();

    if (!loginUser) {
        return (
            <NotFound />
        );
    }

    return (
        <Outlet />
    );
}

