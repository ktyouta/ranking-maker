import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { MyRankingDetailView } from './my-ranking-detail-view';

const baseProps = {
    title: 'ラーメンランキング',
    icon: '🍜',
    publicStatusLabel: '',
    isPublic: false,
    isFavorite: false,
    onToggleFavorite: vi.fn(),
    memo: '',
    items: [],
    updatedAt: '2026-01-01',
    onStartEdit: vi.fn(),
    onBack: vi.fn(),
    isDeleteDialogOpen: false,
    onClickDelete: vi.fn(),
    onCancelDelete: vi.fn(),
    onConfirmDelete: vi.fn(),
    isMemoDialogOpen: false,
    onClickMemo: vi.fn(),
    onCloseMemo: vi.fn(),
    isItemMemoDialogOpen: false,
    selectedItemName: '',
    selectedItemMemo: '',
    onClickItemMemo: vi.fn(),
    onCloseItemMemo: vi.fn(),
    errMessage: '',
    isLoading: false,
};

describe('MyRankingDetailView', () => {

    test('errMessageが渡された場合、エラーメッセージが表示されること', () => {
        render(<MyRankingDetailView {...baseProps} errMessage="削除に失敗しました" />);

        expect(screen.getByText('削除に失敗しました')).toBeInTheDocument();
    });

    test('errMessageが空文字の場合、エラーメッセージが表示されないこと', () => {
        render(<MyRankingDetailView {...baseProps} />);

        expect(screen.queryByText('削除に失敗しました')).not.toBeInTheDocument();
    });

    test('isLoadingがtrueの場合、ローディングオーバーレイが表示されること', () => {
        const { container } = render(<MyRankingDetailView {...baseProps} isLoading />);

        expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    test('isLoadingがfalseの場合、ローディングオーバーレイが表示されないこと', () => {
        const { container } = render(<MyRankingDetailView {...baseProps} />);

        expect(container.querySelector('.animate-spin')).not.toBeInTheDocument();
    });
});
