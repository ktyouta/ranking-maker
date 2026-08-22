import { LoginUserType } from '@/app/api/verify';
import { Footer } from '@/components';
import { Drawer } from '@/components/ui/drawer/drawer';
import { paths } from '@/config/paths';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { HiBars3, HiOutlineArrowLeftOnRectangle, HiOutlineArrowRightOnRectangle, HiOutlinePlusCircle, HiOutlineUser, HiOutlineUserCircle } from 'react-icons/hi2';
import { IoTriangle } from "react-icons/io5";
import { Link, NavLink } from 'react-router-dom';

type PropsType = {
    children: ReactNode;
    isLoggingOut: boolean;
    moveHome: () => void;
    loginUser: LoginUserType | null;
    loginHref: string;
    moveUserInfoUpdate(): void;
    movePasswordUpdate(): void;
    logout(): void;
};

export function Dashboard(props: PropsType) {
    // ドロワー開閉フラグ
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    // ユーザーメニュー表示フラグ
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    return (
        <div className="flex min-h-screen w-full flex-col bg-canvas">

            {/* ヘッダー */}
            <header className="sticky top-0 z-30 flex h-16 w-full items-center gap-3 bg-accent px-3 text-white shadow-sm">
                <button
                    type="button"
                    onClick={() => setIsDrawerOpen(true)}
                    className="p-2"
                    aria-label="メニューを開く"
                >
                    <HiBars3 className="h-6 w-6" />
                </button>
                <h1 className="text-[18px] sm:text-[24px] font-bold flex-1 tracking-wide cursor-pointer"
                    onClick={props.moveHome}
                >
                    Ranking Maker
                </h1>
                {
                    props.loginUser &&
                    // ユーザーアイコン
                    <div className='flex items-center relative'
                        onClick={() => { setIsUserMenuOpen(true) }}
                    >
                        <span className='mr-[10px] text-base sm:text-[18px] cursor-pointer'>
                            {props.loginUser.name}
                        </span>
                        <HiOutlineUserCircle className="size-8 cursor-pointer mr-[12px]" />
                        <IoTriangle className={`size-4 cursor-pointer ${isUserMenuOpen ? 'rotate-0' : 'rotate-180'}`} />
                        {/* ユーザーメニュー */}
                        {
                            isUserMenuOpen &&
                            <div className='w-64 absolute top-12 right-0 text-sm rounded-lg bg-white border border-gray-200 shadow-lg z-20 py-2'>
                                <button className='block w-full text-left px-5 py-3 text-gray-700 hover:bg-gray-100 transition-colors'
                                    onClick={props.moveUserInfoUpdate}
                                >
                                    ユーザー情報更新
                                </button>
                                <button className='block w-full text-left px-5 py-3 text-gray-700 hover:bg-gray-100 transition-colors'
                                    onClick={props.movePasswordUpdate}
                                >
                                    パスワード更新
                                </button>
                                <div className='border-t border-gray-200 my-2' />
                                <button className='block w-full text-left px-5 py-3 text-gray-700 hover:bg-gray-100 transition-colors'
                                    onClick={props.logout}
                                >
                                    ログアウト
                                </button>
                            </div>
                        }
                    </div>
                }
                {/* ログインボタン（未ログイン時）。ホバー前提だとタップ操作で押せる場所だと伝わらないため、常時うっすら背景を付ける */}
                {
                    !props.loginUser &&
                    <Link
                        to={props.loginHref}
                        className='flex items-center gap-[7px] rounded-full bg-white/[0.16] px-4 py-2 text-base font-bold text-white hover:bg-white/25'
                    >
                        <HiOutlineArrowLeftOnRectangle className="size-[18px]" />
                        ログイン
                    </Link>
                }
            </header>

            {/* ナビゲーションドロワー */}
            <Drawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                side="left"
                widthClassName="w-64 max-w-xs"
                title="メニュー"
            >
                <nav className="-mx-6 flex flex-col">
                    <NavLink
                        to={paths.home.path}
                        onClick={() => setIsDrawerOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${isActive
                                ? 'text-accent shadow-[inset_3px_0px_0px_#0F9E93]'
                                : 'text-ink hover:bg-canvas hover:text-accent'
                            }`
                        }
                    >
                        <HiOutlineUser className="mr-3 h-5 w-5 shrink-0" />
                        <span>ホーム</span>
                    </NavLink>
                    <NavLink
                        to={paths.myRanking.path}
                        onClick={() => setIsDrawerOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${isActive
                                ? 'text-accent shadow-[inset_3px_0px_0px_#0F9E93]'
                                : 'text-ink hover:bg-canvas hover:text-accent'
                            }`
                        }
                    >
                        <HiOutlineUser className="mr-3 h-5 w-5 shrink-0" />
                        <span>マイランキング</span>
                    </NavLink>
                    <NavLink
                        to={paths.rankingCreate.path}
                        onClick={() => setIsDrawerOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${isActive
                                ? 'text-accent shadow-[inset_3px_0px_0px_#0F9E93]'
                                : 'text-ink hover:bg-canvas hover:text-accent'
                            }`
                        }
                    >
                        <HiOutlinePlusCircle className="mr-3 h-5 w-5 shrink-0" />
                        <span>ランキング作成</span>
                    </NavLink>
                    <button
                        type="button"
                        onClick={props.logout}
                        disabled={props.isLoggingOut}
                        className="flex items-center px-6 py-4 text-left text-sm font-medium text-ink transition-colors hover:bg-canvas hover:text-accent disabled:opacity-50"
                    >
                        <HiOutlineArrowRightOnRectangle className="mr-3 h-5 w-5 shrink-0" />
                        <span>ログアウト</span>
                    </button>
                </nav>
            </Drawer>

            {/* メインコンテンツ */}
            <main className="flex w-full flex-1 flex-col">
                {props.children}
            </main>

            <Footer />
        </div>
    );
}
