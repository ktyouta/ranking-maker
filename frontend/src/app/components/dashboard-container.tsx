import { useLogoutMutation } from '@/app/api/logout';
import { Dashboard } from '@/components/layouts/dashboard/dashboard';
import { paths } from '@/config/paths';
import { useAppNavigation } from '@/hooks/use-app-navigation';
import { resetLogin } from '@/stores/access-token-store';
import { Outlet, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LoginUserContext } from './login-user-provider';

export function DashboardContainer() {

    // ログインユーザー情報
    const loginUser = LoginUserContext.useCtx();
    // ルーティング用
    const { appNavigate } = useAppNavigation();
    // 現在地。未ログイン時のログインボタンからログイン後に元の画面へ戻すために使う
    const location = useLocation();
    // ログアウトミューテーション
    const logoutMutation = useLogoutMutation({
        onSuccess: () => {
            resetLogin();
        },
        onError: (message: string) => {
            toast.error(message);
        },
    });

    // ユーザー情報更新画面遷移
    function moveUserInfoUpdate() {
        appNavigate(paths.updateUser.path);
    }

    // パスワード更新画面遷移
    function movePasswordUpdate() {
        appNavigate(paths.updatePassword.path);
    }

    /**
     * ログアウト
     */
    function handleLogout() {
        logoutMutation.mutate();
    }

    /**
     * ホーム画面遷移
     */
    function moveHome() {
        appNavigate(paths.home.path);
    }

    return (
        <Dashboard
            logout={handleLogout}
            isLoggingOut={logoutMutation.isPending}
            moveHome={moveHome}
            moveUserInfoUpdate={moveUserInfoUpdate}
            movePasswordUpdate={movePasswordUpdate}
            loginUser={loginUser}
            loginHref={paths.login.getHref(location.pathname)}
        >
            <Outlet />
        </Dashboard>
    );
}
