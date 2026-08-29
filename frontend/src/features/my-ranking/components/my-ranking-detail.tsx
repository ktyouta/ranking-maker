import { ComponentProps } from 'react';
import { MyRankingDetailEdit } from './my-ranking-detail-edit';
import { MyRankingDetailView } from './my-ranking-detail-view';

type PropsType = {
    mode: 'view' | 'edit';
    view: ComponentProps<typeof MyRankingDetailView>;
    edit: ComponentProps<typeof MyRankingDetailEdit>;
};

/**
 * ランキング詳細画面（閲覧・編集モードの出し分け）
 */
export function MyRankingDetail(props: PropsType) {

    const { mode, view, edit } = props;

    if (mode === 'edit') {
        return <MyRankingDetailEdit {...edit} />;
    }

    return <MyRankingDetailView {...view} />;
}
