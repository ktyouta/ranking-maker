import { NotFound } from '@/components';
import { paths } from '@/config/paths';
import { CreateRankingContainer } from '@/features/create-ranking/components/create-ranking-container';
import { LoginContainer } from '@/features/login/components/login-container';
import { MyRankingContainer } from '@/features/my-ranking/components/my-ranking-container';
import { SignupContainer } from '@/features/signup/components/signup-container';
import { UpdatePasswordContainer } from '@/features/updatepassword/components/update-password-container';
import { UpdateUserContainer } from '@/features/updateuser/components/update-user-container';
import { useEffect } from 'react';
import { Navigate, useLocation, useNavigationType, useRoutes } from 'react-router-dom';
import { DashboardContainer } from './dashboard-container';
import { GuestRoute } from './guest-route';
import { ProtectedRoute } from './protected-route';


const routerList = [
    {
        path: paths.home.path,
        element: (
            // マイランキング画面をホームとして使う
            <Navigate to={paths.myRanking.path} replace />
        )
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <DashboardContainer />,
                children: [
                    {
                        path: paths.myRanking.path,
                        element: (
                            <MyRankingContainer />
                        )
                    },
                    {
                        path: paths.rankingCreate.path,
                        element: (
                            <CreateRankingContainer />
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

    useEffect(() => {
        if (navigationType !== "POP") {
            window.scrollTo(0, 0);
        }
    }, [pathname]);

    return router;
};
