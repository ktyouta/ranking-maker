import { useLogoutMutation } from '@/app/api/logout';
import { Dashboard } from '@/components/layouts/dashboard/dashboard';
import { paths } from '@/config/paths';
import { useAppNavigation } from '@/hooks/use-app-navigation';
import { resetLogin } from '@/stores/access-token-store';
import { useState } from 'react';
import { HiOutlineListBullet, HiOutlinePlusCircle, HiOutlineTrash } from 'react-icons/hi2';
import { Outlet } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LoginUserContext } from './login-user-provider';
import { ThemeSelectDialogContainer } from './theme-select-dialog-container';

const navItems = [
    // { to: paths.home.path, label: 'ホーム', icon: <HiOutlineHome className="h-5 w-5 shrink-0" />, isProtected: paths.home.isProtected },
    { to: paths.myRanking.path, label: 'ホーム', icon: <HiOutlineListBullet className="h-5 w-5 shrink-0" />, isProtected: paths.myRanking.isProtected },
    { to: paths.rankingCreate.path, label: 'ランキング作成', icon: <HiOutlinePlusCircle className="h-5 w-5 shrink-0" />, isProtected: paths.rankingCreate.isProtected },
    { to: paths.trash.path, label: 'ゴミ箱', icon: <HiOutlineTrash className="h-5 w-5 shrink-0" />, isProtected: paths.trash.isProtected },
];

export function DashboardContainer() {

    // ログインユーザー情報
    const loginUser = LoginUserContext.useCtx();
    // ルーティング用
    const { appNavigate } = useAppNavigation();
    // テーマ設定ダイアログ開閉フラグ
    const [isThemeDialogOpen, setIsThemeDialogOpen] = useState(false);
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
     * テーマ設定ダイアログを開く
     */
    function openThemeSettings() {
        setIsThemeDialogOpen(true);
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
        appNavigate(paths.myRanking.path);
    }

    /**
     * ログイン画面遷移
     */
    function moveLogin() {
        appNavigate(paths.login.path);
    }

    return (
        <>
            <Dashboard
                logout={handleLogout}
                isLoggingOut={logoutMutation.isPending}
                moveHome={moveHome}
                moveUserInfoUpdate={moveUserInfoUpdate}
                movePasswordUpdate={movePasswordUpdate}
                openThemeSettings={openThemeSettings}
                loginUser={loginUser}
                moveLogin={moveLogin}
                navItems={navItems.filter((e) => {
                    return !e.isProtected || !!loginUser;
                })}
            >
                <Outlet />
            </Dashboard>
            <ThemeSelectDialogContainer
                isOpen={isThemeDialogOpen}
                onClose={() => setIsThemeDialogOpen(false)}
            />
        </>
    );
}
