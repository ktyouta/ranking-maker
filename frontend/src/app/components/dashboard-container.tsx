import { useLogoutMutation } from '@/app/api/logout';
import { Dashboard } from '@/components/layouts/dashboard/dashboard';
import { paths } from '@/config/paths';
import { useAppNavigation } from '@/hooks/use-app-navigation';
import { resetLogin } from '@/stores/access-token-store';
import { HiOutlineListBullet, HiOutlinePlusCircle } from 'react-icons/hi2';
import { Outlet } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LoginUserContext } from './login-user-provider';

const navItems = [
    // { to: paths.home.path, label: 'ホーム', icon: <HiOutlineHome className="h-5 w-5 shrink-0" />, isProtected: paths.home.isProtected },
    { to: paths.myRanking.path, label: 'ホーム', icon: <HiOutlineListBullet className="h-5 w-5 shrink-0" />, isProtected: paths.myRanking.isProtected },
    { to: paths.rankingCreate.path, label: 'ランキング作成', icon: <HiOutlinePlusCircle className="h-5 w-5 shrink-0" />, isProtected: paths.rankingCreate.isProtected },
];

export function DashboardContainer() {

    // ログインユーザー情報
    const loginUser = LoginUserContext.useCtx();
    // ルーティング用
    const { appNavigate } = useAppNavigation();
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

    /**
     * ログイン画面遷移。現在地をログイン後の戻り先として付与する
     */
    function moveLogin() {
        appNavigate(paths.login.path);
    }

    return (
        <Dashboard
            logout={handleLogout}
            isLoggingOut={logoutMutation.isPending}
            moveHome={moveHome}
            moveUserInfoUpdate={moveUserInfoUpdate}
            movePasswordUpdate={movePasswordUpdate}
            loginUser={loginUser}
            moveLogin={moveLogin}
            navItems={navItems.filter((e) => {
                return !e.isProtected || !!loginUser;
            })}
        >
            <Outlet />
        </Dashboard>
    );
}
