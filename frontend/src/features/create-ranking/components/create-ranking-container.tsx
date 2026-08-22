import { useCreateRanking } from "../hooks/use-create-ranking";
import { CreateRanking } from "./create-ranking";

export function CreateRankingContainer() {

    const props = useCreateRanking();

    return (
        <CreateRanking
            {...props}
        />
    );
}
