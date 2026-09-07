import { useMyRankingDetailEdit } from '../hooks/use-my-ranking-detail-edit';
import { MyRankingDetailEdit } from './my-ranking-detail-edit';

type PropsType = {
    onCancel: () => void;
    onSaveSuccess: () => void;
};

export function MyRankingDetailEditContainer(props: PropsType) {

    const { onCancel, onSaveSuccess } = props;
    const edit = useMyRankingDetailEdit({ onCancel, onSaveSuccess });

    return <MyRankingDetailEdit {...edit} />;
}
