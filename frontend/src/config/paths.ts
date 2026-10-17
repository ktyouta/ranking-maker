export const paths = {
    home: {
        path: '/',
        isProtected: false,
    },
    ranking: {
        path: '/ranking',
        isProtected: true,
    },
    rankingDetail: {
        path: '/ranking/:rankingId',
        isProtected: true,
        getHref: (rankingId: string) => `/ranking/${rankingId}`,
    },
    rankingCreate: {
        path: '/ranking-create',
        isProtected: true,
    },
    trash: {
        path: '/trash',
        isProtected: true,
    },
    trashDetail: {
        path: '/trash/:rankingId',
        isProtected: true,
        getHref: (rankingId: string) => `/trash/${rankingId}`,
    },
    login: {
        path: '/login',
        getHref: (redirectTo?: string) => `${paths.login.path}${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ``}`,
    },
    signup: {
        path: '/signup',
        getHref: (redirectTo?: string) => `${paths.signup.path}${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ``}`,
    },
    updateUser: {
        path: '/update-user',
        isProtected: true,
        getHref: (redirectTo?: string) => `${paths.updateUser.path}${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ``}`,
    },
    updatePassword: {
        path: '/update-password',
        isProtected: true,
        getHref: (redirectTo?: string) => `${paths.updatePassword.path}${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ``}`,
    }
} as const;