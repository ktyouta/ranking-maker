import { RankingTitle } from "../../shared";
import { RankingId } from "../../shared/value-object/ranking-id";
import { UserId } from "../../user";
import { IRankingTitleUniquenessRepository } from "../repository";

type PropsType = {
    userId: UserId;
    rankingTitle: RankingTitle;
    rankingId: RankingId;
}

export class RankingTitleUniquenessDomainService {

    constructor(private readonly rankingTitleUniquenessRepository: IRankingTitleUniquenessRepository) { }

    /**
     * 同名ランキングの重複判定。
     * rankingId 自身は除外するため、作成・更新のどちらも同じ問い合わせで判定できる。
     */
    async isDuplicated({ userId, rankingTitle, rankingId }: PropsType): Promise<boolean> {
        // 同名ランキングの取得（在れば重複）
        const result = await this.rankingTitleUniquenessRepository.findRanking(userId, rankingTitle, rankingId);
        return result.length > 0;
    }
}