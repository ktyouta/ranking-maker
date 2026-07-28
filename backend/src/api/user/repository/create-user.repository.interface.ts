import type { UserMaster } from "../../../infrastructure/db";
import type { UserName } from "../../../domain";
import type { UserEntity, UserLoginEntity } from "../entity";

export interface ICreateUserRepository {
  findByUserName(userName: UserName): Promise<UserMaster[]>;
  insertUser(entity: UserEntity): Promise<UserMaster>;
  insertLoginUser(entity: UserLoginEntity): Promise<void>;
}
