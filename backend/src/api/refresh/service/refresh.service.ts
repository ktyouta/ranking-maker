import type { UserMaster } from "../../../infrastructure/db";
import type { UserId } from "../../../domain";
import type { IRefreshRepository } from "../repository";

/**
 * リフレッシュサービス
 */
export class RefreshService {
  constructor(private readonly repository: IRefreshRepository) {}

  /**
   * ユーザー情報を取得
   */
  async getUser(userId: UserId): Promise<UserMaster | undefined> {
    return await this.repository.findByUserId(userId);
  }
}
