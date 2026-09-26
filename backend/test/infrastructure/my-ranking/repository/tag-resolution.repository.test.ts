import { drizzle } from "drizzle-orm/d1";
import { env } from "cloudflare:test";
import { ulid } from "ulid";
import { describe, expect, it } from "vitest";
import { TagName } from "../../../../src/domain/my-ranking";
import { UserId } from "../../../../src/domain/shared";
import * as schema from "../../../../src/infrastructure/db/schema";
import { tagMaster, userMaster } from "../../../../src/infrastructure/db/schema";
import { TagResolutionRepository } from "../../../../src/infrastructure/my-ranking/repository/tag-resolution.repository";

describe("TagResolutionRepository", () => {

    it("findTags: 本人のタグのうち、指定したタグ名に一致するものだけを集約として返すこと", async () => {
        const db = drizzle(env.DB, { schema });
        const now = new Date().toISOString();
        const userId = ulid();
        const otherUserId = ulid();
        const ramenTagId = ulid();

        await db.insert(userMaster).values([
            { id: userId, name: `test-user-${userId}`, createdAt: now, updatedAt: now },
            { id: otherUserId, name: `test-user-${otherUserId}`, createdAt: now, updatedAt: now },
        ]);
        await db.insert(tagMaster).values([
            { id: ramenTagId, userId, name: "ラーメン", createdAt: now, updatedAt: now },
            { id: ulid(), userId, name: "寿司", createdAt: now, updatedAt: now },
            { id: ulid(), userId: otherUserId, name: "ラーメン", createdAt: now, updatedAt: now },
        ]);

        const repository = new TagResolutionRepository(db);
        const result = await repository.findTags(UserId.of(userId), [new TagName("ラーメン"), new TagName("カレー")]);

        expect(result.map((e) => ({ id: e.id, userId: e.userId, name: e.name }))).toEqual([
            { id: ramenTagId, userId, name: "ラーメン" },
        ]);
    });
});
