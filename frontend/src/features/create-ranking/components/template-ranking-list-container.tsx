import { useTemplateRankingList } from "../hooks/use-template-ranking-list";
import { TemplateRankingList } from "./template-ranking-list";

type PropsType = {
    onSelectRanking: (rankingId: string) => void;
};

export function TemplateRankingListContainer(props: PropsType) {

    const { list, totalPages, currentPage, onPageChange } = useTemplateRankingList();

    return (
        <TemplateRankingList
            list={list}
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={onPageChange}
            onSelectRanking={props.onSelectRanking}
        />
    );
}
