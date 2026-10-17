import { useRankingDetailView } from '../hooks/use-ranking-detail-view';
import { RankingDetailView } from './ranking-detail-view';

type PropsType = {
    onStartEdit: () => void;
};

export function RankingDetailViewContainer(props: PropsType) {

    const { onStartEdit } = props;
    const view = useRankingDetailView({ onStartEdit });

    return <RankingDetailView {...view} />;
}
