import { RankingTitle } from "../../shared";
import { UserId } from "../../user";
import { IRankingTitleUniquenessRepository } from "../repository";

type PropsType = {
    userId: UserId;
    rankingTitle: RankingTitle;
}

export class RankingTitleUniquenessDomainService {

    constructor(private readonly rankingTitleUniquenessRepository: IRankingTitleUniquenessRepository) { }

    async isDuplicated({ userId, rankingTitle }: PropsType): Promise<boolean> {
        // 同名ランキングの取得（在れば重複）
        const result = await this.rankingTitleUniquenessRepository.findRanking(userId, rankingTitle);
        return result.length > 0;
    }
}