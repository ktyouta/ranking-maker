import { NotFound } from '@/components';
import { paths } from '@/config/paths';
import { HomeContainer } from '@/features/home/components/home-container';
import { LoginContainer } from '@/features/login/components/login-container';
import { SignupContainer } from '@/features/signup/components/signup-container';
import { UpdatePasswordContainer } from '@/features/updatepassword/components/update-password-container';
import { UpdateUserContainer } from '@/features/updateuser/components/update-user-container';
import { useEffect } from 'react';
import { useLocation, useNavigationType, useRoutes } from 'react-router-dom';
import { DashboardContainer } from './dashboard-container';
import { GuestRoute } from './guest-route';
import { ProtectedRoute } from './protected-route';


const routerList = [
    {
        element: <DashboardContainer />,
        children: [
            {
                path: paths.home.path,
                element: (
                    <HomeContainer />
                )
            },
            {
                element: <ProtectedRoute />,
                children: [
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
                    }
                ]
            }
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
