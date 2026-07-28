import type { UserMaster } from "../../infrastructure/db";
import type { UserId } from "../../domain";
import type { IAuthRepository } from "../repository";

/**
 * 認証サービス
 */
export class AuthService {
  constructor(private readonly repository: IAuthRepository) {}

  /**
   * ユーザーIDでユーザー情報を取得
   * @param userId ユーザーID
   */
  async getUserById(userId: UserId): Promise<UserMaster | undefined> {
    return await this.repository.findByUserId(userId);
  }
}
