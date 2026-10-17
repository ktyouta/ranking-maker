import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { RankingCard } from './ranking-card';

describe('RankingCard', () => {

    test('クリックすると onSelect が id 付きで呼ばれる', () => {

        const onSelect = vi.fn();

        render(
            <RankingCard
                id="ranking-1"
                title="好きなラーメン屋ランキング"
                icon="🏆"
                itemCount={5}
                updatedAt="3日前"
                isFavorite={false}
                onSelect={onSelect}
                onToggleFavorite={vi.fn()}
            />
        );

        fireEvent.click(screen.getByText('好きなラーメン屋ランキング'));

        expect(onSelect).toHaveBeenCalledWith('ranking-1');
    });

    test('お気に入りボタンをクリックすると onToggleFavorite が呼ばれ、onSelect は呼ばれない', () => {

        const onSelect = vi.fn();
        const onToggleFavorite = vi.fn();

        render(
            <RankingCard
                id="ranking-1"
                title="好きなラーメン屋ランキング"
                icon="🏆"
                itemCount={5}
                updatedAt="3日前"
                isFavorite={false}
                onSelect={onSelect}
                onToggleFavorite={onToggleFavorite}
            />
        );

        fireEvent.click(screen.getByLabelText('お気に入りに登録する'));

        expect(onToggleFavorite).toHaveBeenCalledWith('ranking-1', false);
        expect(onSelect).not.toHaveBeenCalled();
    });

    test('カード内部の z-index がページ全体のスタッキング順に漏れ出さないよう、カード自身が独立したスタッキングコンテキストを持つ', () => {

        const { container } = render(
            <RankingCard
                id="ranking-1"
                title="好きなラーメン屋ランキング"
                icon="🏆"
                itemCount={5}
                updatedAt="3日前"
                isFavorite={false}
                onSelect={vi.fn()}
                onToggleFavorite={vi.fn()}
            />
        );

        expect(container.querySelector('.isolate')).toBeInTheDocument();
    });

    test('選択モード時にチェックボックスが表示される', () => {

        render(
            <RankingCard
                id="ranking-1"
                title="好きなラーメン屋ランキング"
                icon="🏆"
                itemCount={5}
                updatedAt="3日前"
                isFavorite={false}
                onSelect={vi.fn()}
                onToggleFavorite={vi.fn()}
                isSelectionMode
                isSelected={false}
                onToggleSelect={vi.fn()}
            />
        );

        expect(screen.getByLabelText('選択する')).toBeInTheDocument();
    });

    test('選択モード時でもカードをクリックすると onSelect が id 付きで呼ばれる（選択トグルかどうかの判断は呼び出し元の責務）', () => {

        const onSelect = vi.fn();
        const onToggleSelect = vi.fn();

        render(
            <RankingCard
                id="ranking-1"
                title="好きなラーメン屋ランキング"
                icon="🏆"
                itemCount={5}
                updatedAt="3日前"
                isFavorite={false}
                onSelect={onSelect}
                onToggleFavorite={vi.fn()}
                isSelectionMode
                isSelected={false}
                onToggleSelect={onToggleSelect}
            />
        );

        fireEvent.click(screen.getByText('好きなラーメン屋ランキング'));

        expect(onSelect).toHaveBeenCalledWith('ranking-1');
    });

    test('チェックボックスをクリックすると onToggleSelect が id 付きで呼ばれ、onSelect は呼ばれない', () => {

        const onSelect = vi.fn();
        const onToggleSelect = vi.fn();

        render(
            <RankingCard
                id="ranking-1"
                title="好きなラーメン屋ランキング"
                icon="🏆"
                itemCount={5}
                updatedAt="3日前"
                isFavorite={false}
                onSelect={onSelect}
                onToggleFavorite={vi.fn()}
                isSelectionMode
                isSelected={false}
                onToggleSelect={onToggleSelect}
            />
        );

        fireEvent.click(screen.getByLabelText('選択する'));

        expect(onToggleSelect).toHaveBeenCalledWith('ranking-1');
        expect(onSelect).not.toHaveBeenCalled();
    });

    test('選択モード時、お気に入り登録済みのカードも通常通りチェックボックスで選択できる（CSV出力等、削除以外の一括操作でもお気に入りを選択できる必要があるため）', () => {

        const onToggleSelect = vi.fn();

        render(
            <RankingCard
                id="ranking-1"
                title="好きなラーメン屋ランキング"
                icon="🏆"
                itemCount={5}
                updatedAt="3日前"
                isFavorite
                onSelect={vi.fn()}
                onToggleFavorite={vi.fn()}
                isSelectionMode
                isSelected={false}
                onToggleSelect={onToggleSelect}
            />
        );

        fireEvent.click(screen.getByLabelText('選択する'));

        expect(onToggleSelect).toHaveBeenCalledWith('ranking-1');
    });
});
