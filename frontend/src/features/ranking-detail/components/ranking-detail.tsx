import { ComponentProps } from 'react';
import { RankingDetailEdit } from './ranking-detail-edit';
import { RankingDetailView } from './ranking-detail-view';

type PropsType = {
    mode: 'view' | 'edit';
    view: ComponentProps<typeof RankingDetailView>;
    edit: ComponentProps<typeof RankingDetailEdit>;
};

/**
 * ランキング詳細画面（閲覧・編集モードの出し分け）
 */
export function RankingDetail(props: PropsType) {

    const { mode, view, edit } = props;

    if (mode === 'edit') {
        return <RankingDetailEdit {...edit} />;
    }

    return <RankingDetailView {...view} />;
}
