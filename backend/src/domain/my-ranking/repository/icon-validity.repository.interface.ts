import { RankingIcon } from "../value-object";

export interface IIconValidityRepository {
    /**
     * 指定したアイコンIDが icon_master に存在し、有効（未削除）かどうかを判定する
     */
    exists(rankingIcon: RankingIcon): Promise<boolean>;
}
