import type { UserId } from "../../../shared";
import type { UserName } from "../../value-object";
import { type IUserNameUniquenessRepository } from "../../repository";

type PropsType = {
    userName: UserName;
    userId: UserId;
}

export class UserNameUniquenessDomainService {

    constructor(private readonly repository: IUserNameUniquenessRepository) { }

    /**
     * 同名ユーザーの重複判定。
     * userId 自身は除外するため、作成・更新のどちらも同じ問い合わせで判定できる。
     */
    async isDuplicated({ userName, userId }: PropsType): Promise<boolean> {
        // 同名ユーザーの取得（在れば重複）
        const result = await this.repository.findUser(userName, userId);
        return result.length > 0;
    }
}