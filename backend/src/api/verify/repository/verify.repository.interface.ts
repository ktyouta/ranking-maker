import type { UserId } from "../../../domain";
import type { UserMaster } from "../../../infrastructure/db";

/**
 * 認証チェックリポジトリインターフェース
 */
export interface IVerifyRepository {
    /**
     * ユーザーIDでユーザー情報を取得
     * @param userId ユーザーID
     */
    findByUserId(userId: UserId): Promise<UserMaster | undefined>;
}
