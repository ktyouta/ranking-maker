import { RankingTitle } from "../../shared";
import { UserId } from "../../user";

export interface IRankingTitleUniquenessRepository {
    /**
     * 同名ランキングの取得（同一ユーザー内・未削除のもの）
     */
    findRanking(userId: UserId, rankingTitle: RankingTitle): Promise<{ id: string }[]>;
}