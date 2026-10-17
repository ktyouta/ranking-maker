import { useRankingDetailEdit } from '../hooks/use-ranking-detail-edit';
import { RankingDetailEdit } from './ranking-detail-edit';

type PropsType = {
    onCancel: () => void;
    onSaveSuccess: () => void;
};

export function RankingDetailEditContainer(props: PropsType) {

    const { onCancel, onSaveSuccess } = props;
    const edit = useRankingDetailEdit({ onCancel, onSaveSuccess });

    return <RankingDetailEdit {...edit} />;
}
