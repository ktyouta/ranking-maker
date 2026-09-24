import { RankingTitle } from "../value-object";
import { RankingId, UserId } from "../../shared";

export interface IRankingTitleUniquenessRepository {
    /**
     * 同名ランキングの取得（同一ユーザー内・未削除のもの）
     * rankingId 自身は判定対象から除外する（更新時の自己重複を防ぐ）。
     * 新規作成では未使用の ID を渡すため、除外は実質的に無効となる。
     */
    findRanking(userId: UserId, rankingTitle: RankingTitle, rankingId: RankingId): Promise<{ id: string }[]>;

    /**
     * 複数ランキング分の同名ランキングを一括取得する（同一ユーザー内・未削除のもの）。
     * rankingIds 自身は判定対象から除外する（一括判定時の自己重複を防ぐ）。
     */
    findRankings(userId: UserId, rankingIds: RankingId[]): Promise<{ id: string, title: string }[]>;
}