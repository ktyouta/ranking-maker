import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {

    // <a>（react-router-dom の Link）への回帰を検知するためのテスト
    test('未ログイン時、ログインボタンが button 要素として描画される', () => {

        const moveLogin = vi.fn();

        render(
            <MemoryRouter>
                <Dashboard
                    isLoggingOut={false}
                    moveHome={vi.fn()}
                    loginUser={null}
                    moveLogin={moveLogin}
                    moveUserInfoUpdate={vi.fn()}
                    movePasswordUpdate={vi.fn()}
                    logout={vi.fn()}
                    navItems={[]}
                >
                    <div />
                </Dashboard>
            </MemoryRouter>
        );

        const loginButton = screen.getByRole('button', { name: 'ログイン' });
        expect(loginButton.tagName).toBe('BUTTON');
    });

    test('ログインボタン押下で moveLogin が呼ばれる', () => {

        const moveLogin = vi.fn();

        render(
            <MemoryRouter>
                <Dashboard
                    isLoggingOut={false}
                    moveHome={vi.fn()}
                    loginUser={null}
                    moveLogin={moveLogin}
                    moveUserInfoUpdate={vi.fn()}
                    movePasswordUpdate={vi.fn()}
                    logout={vi.fn()}
                    navItems={[]}
                >
                    <div />
                </Dashboard>
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

        expect(moveLogin).toHaveBeenCalledTimes(1);
    });
});
