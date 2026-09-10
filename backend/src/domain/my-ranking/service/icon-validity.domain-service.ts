import { RankingIcon } from "../value-object";
import { IIconValidityRepository } from "../repository";

export class IconValidityDomainService {

    constructor(private readonly iconValidityRepository: IIconValidityRepository) { }

    /**
     * アイコンが icon_master に存在し、有効（未削除）かどうかを判定する
     */
    async isValid(rankingIcon: RankingIcon): Promise<boolean> {
        return this.iconValidityRepository.exists(rankingIcon);
    }
}
