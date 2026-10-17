import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { RankingDetailView } from './ranking-detail-view';

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
    tags: [],
    isTagDialogOpen: false,
    onClickTag: vi.fn(),
    onCloseTag: vi.fn(),
    isItemMemoDialogOpen: false,
    selectedItemName: '',
    selectedItemMemo: '',
    onClickItemMemo: vi.fn(),
    onCloseItemMemo: vi.fn(),
    errMessage: '',
    isLoading: false,
};

describe('RankingDetailView', () => {

    test('errMessageが渡された場合、エラーメッセージが表示されること', () => {
        render(<RankingDetailView {...baseProps} errMessage="削除に失敗しました" />);

        expect(screen.getByText('削除に失敗しました')).toBeInTheDocument();
    });

    test('errMessageが空文字の場合、エラーメッセージが表示されないこと', () => {
        render(<RankingDetailView {...baseProps} />);

        expect(screen.queryByText('削除に失敗しました')).not.toBeInTheDocument();
    });

    test('isLoadingがtrueの場合、ローディングオーバーレイが表示されること', () => {
        const { container } = render(<RankingDetailView {...baseProps} isLoading />);

        expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    test('isLoadingがfalseの場合、ローディングオーバーレイが表示されないこと', () => {
        const { container } = render(<RankingDetailView {...baseProps} />);

        expect(container.querySelector('.animate-spin')).not.toBeInTheDocument();
    });

    test('タグダイアログを開いた場合、付いているタグが表示されること', () => {
        render(<RankingDetailView {...baseProps} tags={['グルメ', '東京']} isTagDialogOpen />);

        expect(screen.getByText('グルメ')).toBeInTheDocument();
        expect(screen.getByText('東京')).toBeInTheDocument();
    });

    test('タグがない状態でタグダイアログを開いた場合、タグがない旨が表示されること', () => {
        render(<RankingDetailView {...baseProps} isTagDialogOpen />);

        expect(screen.getByText('タグはありません')).toBeInTheDocument();
    });
});
