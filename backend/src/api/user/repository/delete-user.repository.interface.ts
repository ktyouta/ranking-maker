import type { UserId } from "../../../domain";

export interface IDeleteUserRepository {
  deleteUser(userId: UserId): Promise<boolean>;
  deleteLoginUser(userId: UserId): Promise<void>;
}
