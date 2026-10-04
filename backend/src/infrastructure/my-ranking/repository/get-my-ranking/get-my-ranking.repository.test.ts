import { drizzle } from "drizzle-orm/d1";
import { env } from "cloudflare:test";
import { ulid } from "ulid";
import { describe, expect, it } from "vitest";
import { RankingId, UserId } from "../../../../domain/shared";
import * as schema from "../../../db/schema/schema";
import { publicStatusMaster, rankingMaster, rankingOrderMaster, rankingTagMaster, tagMaster, userMaster } from "../../../db/schema/schema";
import { GetMyRankingRepository } from "./get-my-ranking.repository";

describe("GetMyRankingRepository", () => {

    it("findRankingOrder: order昇順で並び替えられ、各項目のorder値が返る", async () => {
        const db = drizzle(env.DB, { schema });
        const now = new Date().toISOString();

        const userId = ulid();
        const publicStatusId = 1;
        const rankingId = ulid();

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
            createdAt: now,
            updatedAt: now,
        });
        // order=3, 1, 2 の順であえて挿入し、orderBy が効いているか検証する
        await db.insert(rankingOrderMaster).values([
            { id: ulid(), rankingId, order: 3, itemName: "third", createdAt: now, updatedAt: now },
            { id: ulid(), rankingId, order: 1, itemName: "first", createdAt: now, updatedAt: now },
            { id: ulid(), rankingId, order: 2, itemName: "second", createdAt: now, updatedAt: now },
        ]);

        const repository = new GetMyRankingRepository(db);
        const result = await repository.findRankingOrder(RankingId.of(rankingId));

        expect(result.map((e) => e.order)).toEqual([1, 2, 3]);
        expect(result.map((e) => e.itemName)).toEqual(["first", "second", "third"]);
    });

    it("findRanking: memoが返る", async () => {
        const db = drizzle(env.DB, { schema });
        const now = new Date().toISOString();

        const userId = ulid();
        const publicStatusId = 1;
        const rankingId = ulid();

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
            memo: "test-memo",
            publicStatus: publicStatusId,
            createdAt: now,
            updatedAt: now,
        });

        const repository = new GetMyRankingRepository(db);
        const result = await repository.findRanking(UserId.of(userId), RankingId.of(rankingId));

        expect(result?.memo).toBe("test-memo");
    });

    it("findRankingTag: 紐づくタグ名がname昇順で返り、論理削除された紐づけは返らない", async () => {
        const db = drizzle(env.DB, { schema });
        const now = new Date().toISOString();

        const userId = ulid();
        const publicStatusId = 1;
        const rankingId = ulid();
        const tagIdB = ulid();
        const tagIdA = ulid();
        const deletedTagId = ulid();

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
            createdAt: now,
            updatedAt: now,
        });
        await db.insert(tagMaster).values([
            { id: tagIdB, userId, name: "tag-b", createdAt: now, updatedAt: now },
            { id: tagIdA, userId, name: "tag-a", createdAt: now, updatedAt: now },
            { id: deletedTagId, userId, name: "tag-deleted", createdAt: now, updatedAt: now },
        ]);
        await db.insert(rankingTagMaster).values([
            { id: ulid(), rankingId, tagId: tagIdB, userId, createdAt: now, updatedAt: now },
            { id: ulid(), rankingId, tagId: tagIdA, userId, createdAt: now, updatedAt: now },
            { id: ulid(), rankingId, tagId: deletedTagId, userId, deleteFlg: true, createdAt: now, updatedAt: now },
        ]);

        const repository = new GetMyRankingRepository(db);
        const result = await repository.findRankingTag(UserId.of(userId), RankingId.of(rankingId));

        expect(result.map((e) => e.name)).toEqual(["tag-a", "tag-b"]);
    });
});
