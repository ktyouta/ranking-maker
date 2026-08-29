import { drizzle } from "drizzle-orm/d1";
import { env } from "cloudflare:test";
import { ulid } from "ulid";
import { describe, expect, it } from "vitest";
import { RankingId } from "../../../../src/domain/shared";
import * as schema from "../../../../src/infrastructure/db/schema";
import { publicStatusMaster, rankingMaster, rankingOrderMaster, userMaster } from "../../../../src/infrastructure/db/schema";
import { GetMyRankingRepository } from "../../../../src/infrastructure/my-ranking/repository/get-my-ranking.repository";

describe("GetMyRankingRepository.findRankingOrder", () => {

    it("order昇順で並び替えられ、各項目のorder値が返る", async () => {
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
});
