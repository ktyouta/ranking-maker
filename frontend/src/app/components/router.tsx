import { NotFound } from '@/components';
import { paths } from '@/config/paths';
import { CreateRankingContainer } from '@/features/create-ranking/components/create-ranking-container';
import { LoginContainer } from '@/features/login/components/login-container';
import { RankingContainer } from '@/features/ranking/components/ranking-container';
import { RankingDetailContainer } from '@/features/ranking/components/ranking-detail-container';
import { SignupContainer } from '@/features/signup/components/signup-container';
import { TrashContainer } from '@/features/trash/components/trash-container';
import { TrashDetailContainer } from '@/features/trash/components/trash-detail-container';
import { UpdatePasswordContainer } from '@/features/updatepassword/components/update-password-container';
import { UpdateUserContainer } from '@/features/updateuser/components/update-user-container';
import { useEffect, useEffectEvent } from 'react';
import { Navigate, useLocation, useNavigationType, useRoutes } from 'react-router-dom';
import { DashboardContainer } from './dashboard-container';
import { GuestRoute } from './guest-route';
import { ProtectedRoute } from './protected-route';


const routerList = [
    {
        path: paths.home.path,
        element: (
            // マイランキング画面をホームとして使う
            <Navigate to={paths.ranking.path} replace />
        )
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <DashboardContainer />,
                children: [
                    {
                        path: paths.ranking.path,
                        element: (
                            <RankingContainer />
                        )
                    },
                    {
                        path: paths.rankingCreate.path,
                        element: (
                            <CreateRankingContainer />
                        )
                    },
                    {
                        path: paths.rankingDetail.path,
                        element: (
                            <RankingDetailContainer />
                        )
                    },
                    {
                        path: paths.trash.path,
                        element: (
                            <TrashContainer />
                        )
                    },
                    {
                        path: paths.trashDetail.path,
                        element: (
                            <TrashDetailContainer />
                        )
                    }
                ]
            },
            {
                path: paths.updateUser.path,
                element: (
                    <UpdateUserContainer />
                )
            },
            {
                path: paths.updatePassword.path,
                element: (
                    <UpdatePasswordContainer />
                )
            },
        ]
    },
    {
        element: <GuestRoute />,
        children: [
            {
                path: paths.login.path,
                element: (
                    <LoginContainer />
                )
            },
            {
                path: paths.signup.path,
                element: (
                    <SignupContainer />
                )
            }
        ]
    },
    {
        path: `*`,
        element: <NotFound />
    }
];

export const AppRouter = () => {
    const router = useRoutes(routerList);
    const { pathname } = useLocation();
    const navigationType = useNavigationType();

    // ページ遷移時に先頭へスクロールする（ブラウザの戻る・進むではスクロール位置を保つ）
    const scrollToTopOnNavigate = useEffectEvent(() => {
        if (navigationType !== "POP") {
            window.scrollTo(0, 0);
        }
    });

    // ページ遷移（pathname の変化）時だけ実行する
    useEffect(() => {
        scrollToTopOnNavigate();
    }, [pathname]);

    return router;
};
