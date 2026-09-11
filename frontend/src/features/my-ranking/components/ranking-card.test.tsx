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
                onSelect={onSelect}
            />
        );

        fireEvent.click(screen.getByText('好きなラーメン屋ランキング'));

        expect(onSelect).toHaveBeenCalledWith('ranking-1');
    });
});
