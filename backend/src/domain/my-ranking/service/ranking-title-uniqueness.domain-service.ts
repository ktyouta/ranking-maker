import { RankingTitle } from "../value-object";
import { RankingId } from "../../shared";
import { UserId } from "../../user";
import { IRankingTitleUniquenessRepository } from "../repository";
import { RankingAggregate } from "../aggregate";

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

    /**
     * 複数ランキング分の同名ランキング重複判定。
     * aggregates 自身は除外するため、一括復元等の自己重複を誤検知しない。
     * @param aggregates 判定対象のランキング集約一覧
     * @returns 同名の既存ランキングが存在する集約一覧（重複しているもの）
     */
    async findDuplicated(userId: UserId, aggregates: RankingAggregate[]): Promise<RankingAggregate[]> {
        const rankingIds = aggregates.map((aggregate) => RankingId.of(aggregate.id));
        const result = await this.rankingTitleUniquenessRepository.findRankings(userId, rankingIds);

        return aggregates.filter((aggregate) => {
            return result.some((ranking) => ranking.title === aggregate.title);
        });
    }
}