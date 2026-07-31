import type { EnvBindings, EnvConfig } from "../config";
import type { UserId, UserProfile } from "../domain/user";
import type { Database } from "../infrastructure/db";

export type UserInfoType = UserProfile;

export type AuthUserType = {
  userId: UserId;
  info: UserInfoType;
};

export type AppEnv = {
  Bindings: EnvBindings;
  Variables: {
    requestId: string;
    user?: AuthUserType;
    db: Database;
    envConfig: EnvConfig;
  };
};
