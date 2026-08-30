import { LoginUserType } from '@/app/api/verify';
import { Button, Footer } from '@/components';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { HiBars3, HiOutlineArrowLeftOnRectangle, HiOutlineArrowRightOnRectangle, HiOutlineUserCircle } from 'react-icons/hi2';
import { IoTriangle } from "react-icons/io5";
import { NavLink } from 'react-router-dom';

type PropsType = {
    children: ReactNode;
    isLoggingOut: boolean;
    moveHome: () => void;
    loginUser: LoginUserType | null;
    moveLogin: () => void;
    moveUserInfoUpdate(): void;
    movePasswordUpdate(): void;
    logout(): void;
    navItems: {
        to: string;
        label: string;
        icon: ReactNode;
    }[];
};

// サイドバーを常時展開表示する最小幅（Tailwind の lg ブレークポイント）
const SIDEBAR_ALWAYS_OPEN_MIN_WIDTH_PX = 1024;


export function Dashboard(props: PropsType) {
    // サイドバー展開フラグ。true=展開(w-64) / false=折りたたみ
    // lg未満: 展開時のみオーバーレイ表示。折りたたみ時は非表示(w-0)。ヘッダーのハンバーガーで開く。
    // lg以上: flex レイアウト内で幅のみ変化。折りたたみ時はアイコン表示(w-20)。
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= SIDEBAR_ALWAYS_OPEN_MIN_WIDTH_PX);
    // ユーザーメニュー表示フラグ
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    return (
        <div className="flex min-h-screen w-full bg-canvas">

            {/* オーバーレイ背景（lg未満・サイドバー展開時のみ表示） */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* サイドバー */}
            <nav
                className={`flex flex-col overflow-hidden bg-accent shadow-md transition-all duration-300 fixed inset-y-0 left-0 z-40 lg:relative lg:inset-auto lg:z-auto ${isSidebarOpen ? 'w-64' : 'w-0 lg:w-20'}`}
            >
                {/* 開閉ボタン */}
                <button
                    type="button"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className={`flex h-16 shrink-0 items-center text-white/80 hover:text-white ${isSidebarOpen ? 'justify-end px-6' : 'justify-center'} mb-[45px]`}
                    aria-label={isSidebarOpen ? 'サイドバーを閉じる' : 'サイドバーを開く'}
                >
                    <HiBars3 className="h-6 w-6" />
                </button>

                {/* メニューリスト */}
                <div className="flex-1 overflow-y-auto pb-3">
                    {
                        props.navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => { if (window.innerWidth < SIDEBAR_ALWAYS_OPEN_MIN_WIDTH_PX) setIsSidebarOpen(false); }}
                                className={({ isActive }) =>
                                    `flex items-center px-6 py-4 text-base font-medium transition-colors whitespace-nowrap ${isSidebarOpen ? '' : 'justify-center'
                                    } ${isActive
                                        ? 'bg-white/20 text-white shadow-[inset_3px_0px_0px_#FFFFFF] hover:text-white'
                                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                                    }`
                                }
                            >
                                <span className={isSidebarOpen ? 'mr-3' : ''}>{item.icon}</span>
                                <span className={isSidebarOpen ? 'block' : 'hidden'}>{item.label}</span>
                            </NavLink>
                        ))
                    }
                    {
                        !!props.loginUser &&
                        <button
                            type="button"
                            onClick={props.logout}
                            disabled={props.isLoggingOut}
                            className={`flex w-full items-center px-6 py-4 text-left text-base font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50 whitespace-nowrap ${isSidebarOpen ? '' : 'justify-center'
                                }`}
                        >
                            <span className={isSidebarOpen ? 'mr-3' : ''}>
                                <HiOutlineArrowRightOnRectangle className="h-5 w-5 shrink-0" />
                            </span>
                            <span className={isSidebarOpen ? 'block' : 'hidden'}>ログアウト</span>
                        </button>
                    }
                </div>
            </nav>

            {/* メインエリア */}
            <div className="flex min-w-0 flex-1 flex-col">

                {/* ヘッダー */}
                <header className="flex h-14 sm:h-[70px] w-full items-center border-b border-line bg-surface px-3 text-ink sm:shadow-sm pl-4 sm:pl-6 pr-4 sm:pr-[50px]">
                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen(true)}
                        className={`mr-3 text-ink-sub hover:text-ink lg:hidden ${isSidebarOpen ? 'hidden' : ''}`}
                        aria-label="メニューを開く"
                    >
                        <HiBars3 className="h-6 w-6" />
                    </button>
                    <div className="flex-1">
                        <span className="text-[18px] sm:text-[28px] font-bold text-accent cursor-pointer"
                            onClick={props.moveHome}
                        >
                            Ranking Maker
                        </span>
                    </div>
                    {
                        props.loginUser &&
                        // ユーザーアイコン
                        <div className='flex items-center relative cursor-pointer'
                            onClick={() => { setIsUserMenuOpen(true) }}
                        >
                            <span className='mr-[5px] text-base sm:text-[18px] cursor-pointer sm:mr-[10px]'>
                                {props.loginUser.name}
                            </span>
                            <HiOutlineUserCircle className="size-7 sm:size-8 cursor-pointer mr-[5px] sm:mr-[12px]" />
                            <IoTriangle className={`size-3 sm:size-4 cursor-pointer ${isUserMenuOpen ? 'rotate-0' : 'rotate-180'}`} />
                            {/* ユーザーメニュー */}
                            {
                                isUserMenuOpen &&
                                <div className='w-64 absolute top-12 right-0 text-sm rounded-lg bg-surface border border-line shadow-lg z-20 py-2'>
                                    <button className='block w-full text-left px-5 py-3 text-ink hover:bg-canvas transition-colors'
                                        onClick={props.moveUserInfoUpdate}
                                    >
                                        ユーザー情報更新
                                    </button>
                                    <button className='block w-full text-left px-5 py-3 text-ink hover:bg-canvas transition-colors'
                                        onClick={props.movePasswordUpdate}
                                    >
                                        パスワード更新
                                    </button>
                                    <div className='border-t border-line my-2' />
                                    <button className='block w-full text-left px-5 py-3 text-ink hover:bg-canvas transition-colors'
                                        onClick={props.logout}
                                    >
                                        ログアウト
                                    </button>
                                </div>
                            }
                        </div>
                    }
                    {/* ログインボタン（未ログイン時） */}
                    {
                        !props.loginUser &&
                        <Button
                            colorType="accent"
                            sizeType="medium"
                            onClick={props.moveLogin}
                            className="flex items-center gap-[7px] rounded-full py-2 text-base font-bold"
                        >
                            <HiOutlineArrowLeftOnRectangle className="size-[18px]" />
                            ログイン
                        </Button>
                    }
                    {
                        isUserMenuOpen &&
                        <div className='fixed inset-0 z-10'
                            onClick={() => { setIsUserMenuOpen(false) }}
                        />
                    }
                </header>

                {/* メインコンテンツ */}
                <main className="flex w-full flex-1 flex-col">
                    {props.children}
                </main>

                <Footer />
            </div>
        </div>
    );
}
