import type { UserId } from "../../../domain";
import type { UserMaster } from "../../../infrastructure/db";
import { IVerifyRepository } from "../repository/verify.repository.interface";

/**
 * ログインサービス
 */
export class VerifyService {
    constructor(private readonly repository: IVerifyRepository) { }

    /**
     * ユーザー情報を取得
     */
    async getUser(userId: UserId): Promise<UserMaster | undefined> {
        return await this.repository.findByUserId(userId);
    }
}
