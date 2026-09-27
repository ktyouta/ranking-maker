import { drizzle } from "drizzle-orm/d1";
import { env } from "cloudflare:test";
import { ulid } from "ulid";
import { describe, expect, it } from "vitest";
import { UserId } from "../../../../src/domain/shared";
import * as schema from "../../../../src/infrastructure/db/schema";
import { publicStatusMaster, rankingMaster, rankingTagMaster, tagMaster, userMaster } from "../../../../src/infrastructure/db/schema";
import { GetTagsRepository } from "../../../../src/infrastructure/my-ranking/repository/get-tags.repository";

describe("GetTagsRepository", () => {

    it("findTags: 自分のタグがname昇順で返り、他ユーザーのタグは返らない", async () => {
        const db = drizzle(env.DB, { schema });
        const now = new Date().toISOString();

        const userId = ulid();
        const otherUserId = ulid();

        await db.insert(userMaster).values([
            { id: userId, name: `test-user-${userId}`, createdAt: now, updatedAt: now },
            { id: otherUserId, name: `test-user-${otherUserId}`, createdAt: now, updatedAt: now },
        ]);
        await db.insert(tagMaster).values([
            { id: ulid(), userId, name: "tag-b", createdAt: now, updatedAt: now },
            { id: ulid(), userId, name: "tag-a", createdAt: now, updatedAt: now },
            { id: ulid(), userId: otherUserId, name: "tag-other", createdAt: now, updatedAt: now },
        ]);

        const repository = new GetTagsRepository(db);
        const result = await repository.findTags(UserId.of(userId));

        expect(result.map((e) => e.name)).toEqual(["tag-a", "tag-b"]);
    });

    it("findTags: ゴミ箱のランキングにしか紐づいていないタグも返る", async () => {
        const db = drizzle(env.DB, { schema });
        const now = new Date().toISOString();

        const userId = ulid();
        const publicStatusId = 1;
        const rankingId = ulid();
        const tagId = ulid();

        await db.insert(userMaster).values({
            id: userId,
            name: `test-user-${userId}`,
            createdAt: now,
            updatedAt: now,
        });
        await db.insert(publicStatusMaster).values({
            id: publicStatusId,
            name: `test-status-${publicStatusId}`,
            createdAt: now,
            updatedAt: now,
        }).onConflictDoNothing();
        await db.insert(rankingMaster).values({
            id: rankingId,
            userId,
            title: `test-ranking-${rankingId}`,
            publicStatus: publicStatusId,
            deleteFlg: true,
            createdAt: now,
            updatedAt: now,
        });
        await db.insert(tagMaster).values({ id: tagId, userId, name: "tag-trashed", createdAt: now, updatedAt: now });
        await db.insert(rankingTagMaster).values({ id: ulid(), rankingId, tagId, userId, deleteFlg: true, createdAt: now, updatedAt: now });

        const repository = new GetTagsRepository(db);
        const result = await repository.findTags(UserId.of(userId));

        expect(result.map((e) => e.name)).toEqual(["tag-trashed"]);
    });
});
