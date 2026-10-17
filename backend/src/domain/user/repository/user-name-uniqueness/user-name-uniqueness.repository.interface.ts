import type { UserId } from "../../../shared";
import type { UserName } from "../../value-object";

export interface IUserNameUniquenessRepository {
    /**
     * 同名ユーザーの取得
     * userId 自身は判定対象から除外する（更新時の自己重複を防ぐ）。
     * 新規作成では未使用の ID を渡すため、除外は実質的に無効となる。
     */
    findUser(userName: UserName, userId: UserId): Promise<{ id: string }[]>;
}