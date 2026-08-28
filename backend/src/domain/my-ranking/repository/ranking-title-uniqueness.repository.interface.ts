import { RankingTitle } from "../value-object";
import { RankingId } from "../../shared";
import { UserId } from "../../user";

export interface IRankingTitleUniquenessRepository {
    /**
     * 同名ランキングの取得（同一ユーザー内・未削除のもの）
     * rankingId 自身は判定対象から除外する（更新時の自己重複を防ぐ）。
     * 新規作成では未使用の ID を渡すため、除外は実質的に無効となる。
     */
    findRanking(userId: UserId, rankingTitle: RankingTitle, rankingId: RankingId): Promise<{ id: string }[]>;
}