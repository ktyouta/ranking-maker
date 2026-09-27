import { drizzle } from "drizzle-orm/d1";
import { env } from "cloudflare:test";
import { ulid } from "ulid";
import { describe, expect, it } from "vitest";
import { RankingId, UserId } from "../../../../src/domain/shared";
import * as schema from "../../../../src/infrastructure/db/schema";
import { publicStatusMaster, rankingMaster, rankingTagMaster, tagMaster, userMaster } from "../../../../src/infrastructure/db/schema";
import { GetTrashMyRankingRepository } from "../../../../src/infrastructure/my-ranking/repository/get-trash-my-ranking.repository";

describe("GetTrashMyRankingRepository", () => {

    it("findRankingTag: 削除済みの紐づけのタグ名がname昇順で返り、未削除の紐づけは返らない", async () => {
        const db = drizzle(env.DB, { schema });
        const now = new Date().toISOString();

        const userId = ulid();
        const publicStatusId = 1;
        const rankingId = ulid();
        const tagIdB = ulid();
        const tagIdA = ulid();
        const aliveTagId = ulid();

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
        await db.insert(tagMaster).values([
            { id: tagIdB, userId, name: "tag-b", createdAt: now, updatedAt: now },
            { id: tagIdA, userId, name: "tag-a", createdAt: now, updatedAt: now },
            { id: aliveTagId, userId, name: "tag-alive", createdAt: now, updatedAt: now },
        ]);
        await db.insert(rankingTagMaster).values([
            { id: ulid(), rankingId, tagId: tagIdB, userId, deleteFlg: true, createdAt: now, updatedAt: now },
            { id: ulid(), rankingId, tagId: tagIdA, userId, deleteFlg: true, createdAt: now, updatedAt: now },
            { id: ulid(), rankingId, tagId: aliveTagId, userId, createdAt: now, updatedAt: now },
        ]);

        const repository = new GetTrashMyRankingRepository(db);
        const result = await repository.findRankingTag(UserId.of(userId), RankingId.of(rankingId));

        expect(result.map((e) => e.name)).toEqual(["tag-a", "tag-b"]);
    });
});
