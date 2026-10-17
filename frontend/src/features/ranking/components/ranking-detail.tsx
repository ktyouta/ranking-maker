import { RankingDetailEditContainer } from './ranking-detail-edit-container';
import { RankingDetailViewContainer } from './ranking-detail-view-container';

type PropsType = {
    mode: 'view' | 'edit';
    onStartEdit: () => void;
    onReturnToView: () => void;
};

/**
 * ランキング詳細画面（閲覧・編集モードの出し分け）
 */
export function RankingDetail(props: PropsType) {

    const { mode, onStartEdit, onReturnToView } = props;

    if (mode === 'edit') {
        return (
            <RankingDetailEditContainer
                onCancel={onReturnToView}
                onSaveSuccess={onReturnToView}
            />
        );
    }

    return (
        <RankingDetailViewContainer
            onStartEdit={onStartEdit}
        />
    );
}
