import { MyRankingDetailEditContainer } from './my-ranking-detail-edit-container';
import { MyRankingDetailViewContainer } from './my-ranking-detail-view-container';

type PropsType = {
    mode: 'view' | 'edit';
    onStartEdit: () => void;
    onReturnToView: () => void;
};

/**
 * ランキング詳細画面（閲覧・編集モードの出し分け）
 */
export function MyRankingDetail(props: PropsType) {

    const { mode, onStartEdit, onReturnToView } = props;

    if (mode === 'edit') {
        return (
            <MyRankingDetailEditContainer
                onCancel={onReturnToView}
                onSaveSuccess={onReturnToView}
            />
        );
    }

    return (
        <MyRankingDetailViewContainer
            onStartEdit={onStartEdit}
        />
    );
}
