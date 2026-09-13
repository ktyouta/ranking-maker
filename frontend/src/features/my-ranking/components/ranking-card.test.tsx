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
});
