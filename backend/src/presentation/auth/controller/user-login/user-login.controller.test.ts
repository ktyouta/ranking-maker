import { drizzle } from "drizzle-orm/d1";
import { env, SELF } from "cloudflare:test";
import { ulid } from "ulid";
import { describe, expect, it } from "vitest";
import { createEnvConfig } from "../../../../config";
import { Pepper, UserPassword, UserSalt, RawPassword } from "../../../../domain/user";
import { userLoginMaster, userMaster } from "../../../../infrastructure/db";
import * as schema from "../../../../infrastructure/db/schema/schema";

describe("POST /api/v1/user-login", () => {

    it("パスワードが誤っている場合、400を返すこと", async () => {
        const db = drizzle(env.DB, { schema });
        const now = new Date().toISOString();

        const userId = ulid();
        const loginId = userId;
        const config = createEnvConfig(env);
        const pepper = new Pepper(config.pepper);

        await db.insert(userMaster).values({ id: userId, name: `test-user-${userId}`, birthday: "19900101", createdAt: now, updatedAt: now });

        const salt = UserSalt.create();
        const passwordHash = await UserPassword.hash(RawPassword.create("CorrectHorse1!")._unsafeUnwrap(), salt, pepper);

        await db.insert(userLoginMaster).values({
            id: ulid(),
            userId,
            loginId,
            passwordHash: passwordHash.value,
            salt: salt.value,
            createdAt: now,
            updatedAt: now,
        });

        const res = await SELF.fetch("http://localhost/api/v1/user-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: loginId, password: "WrongHorse1!" }),
        });

        expect(res.status).toBe(400);
    });

    it("存在しないユーザー名の場合、400を返すこと", async () => {
        const res = await SELF.fetch("http://localhost/api/v1/user-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: ulid(), password: "CorrectHorse1!" }),
        });

        expect(res.status).toBe(400);
    });
});
