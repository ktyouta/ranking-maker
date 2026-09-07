import { useMyRankingDetailView } from '../hooks/use-my-ranking-detail-view';
import { MyRankingDetailView } from './my-ranking-detail-view';

type PropsType = {
    onStartEdit: () => void;
};

export function MyRankingDetailViewContainer(props: PropsType) {

    const { onStartEdit } = props;
    const view = useMyRankingDetailView({ onStartEdit });

    return <MyRankingDetailView {...view} />;
}
