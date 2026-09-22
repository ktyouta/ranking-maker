import { MyRankingListReturnType } from '@/app/api/get-my-rankings';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { TemplateRankingList } from './template-ranking-list';

function buildRanking(overrides: Partial<MyRankingListReturnType['list'][number]> = {}): MyRankingListReturnType['list'][number] {
    return {
        id: 'ranking-1',
        title: '好きなラーメン屋ランキング',
        userName: 'テストユーザー',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        publicStatus: 1,
        publicStatusName: '非公開',
        icon: 1,
        itemCount: 5,
        isFavorite: false,
        ...overrides,
    };
}

describe('TemplateRankingList', () => {

    test('タイトルをクリックすると onSelectRanking が id 付きで呼ばれる', () => {

        const onSelectRanking = vi.fn();

        render(
            <TemplateRankingList
                list={[buildRanking()]}
                totalPages={1}
                currentPage={1}
                onPageChange={vi.fn()}
                onSelectRanking={onSelectRanking}
            />
        );

        fireEvent.click(screen.getByText('好きなラーメン屋ランキング'));

        expect(onSelectRanking).toHaveBeenCalledWith('ranking-1');
    });

    test('一覧が0件のとき、空状態メッセージが表示される', () => {

        render(
            <TemplateRankingList
                list={[]}
                totalPages={1}
                currentPage={1}
                onPageChange={vi.fn()}
                onSelectRanking={vi.fn()}
            />
        );

        expect(screen.getByText('テンプレートにできるランキングがありません')).toBeInTheDocument();
    });

    test('totalPages が1件のとき、ページャーは表示されない', () => {

        render(
            <TemplateRankingList
                list={[buildRanking()]}
                totalPages={1}
                currentPage={1}
                onPageChange={vi.fn()}
                onSelectRanking={vi.fn()}
            />
        );

        expect(screen.queryByLabelText('次のページ')).not.toBeInTheDocument();
    });

    test('totalPages が2件以上のとき、ページャー操作で onPageChange が呼ばれる', () => {

        const onPageChange = vi.fn();

        render(
            <TemplateRankingList
                list={[buildRanking()]}
                totalPages={2}
                currentPage={1}
                onPageChange={onPageChange}
                onSelectRanking={vi.fn()}
            />
        );

        fireEvent.click(screen.getByLabelText('次のページ'));

        expect(onPageChange).toHaveBeenCalledWith(2);
    });
});
