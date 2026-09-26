import { drizzle } from "drizzle-orm/d1";
import { env } from "cloudflare:test";
import { inArray } from "drizzle-orm";
import { ulid } from "ulid";
import { describe, expect, it } from "vitest";
import { RankingId, UserId } from "../../../../src/domain/shared";
import * as schema from "../../../../src/infrastructure/db/schema";
import { publicStatusMaster, rankingMaster, rankingTagMaster, tagMaster, userMaster } from "../../../../src/infrastructure/db/schema";
import { BulkSoftDeleteMyRankingRepository } from "../../../../src/infrastructure/my-ranking/repository/bulk-soft-delete-my-ranking.repository";

describe("BulkSoftDeleteMyRankingRepository", () => {

    it("findRankings→delete→deleteRankings: ランキングごとにタグ付けを集約に含め、削除状態をタグ付けに反映すること", async () => {
        const db = drizzle(env.DB, { schema });
        const now = new Date().toISOString();
        const userId = ulid();
        const publicStatusId = 1;
        const rankingIds = [ulid(), ulid()];
        const tagId = ulid();
        const rankingTagIds = [ulid(), ulid()];

        await db.insert(userMaster).values({ id: userId, name: `test-user-${userId}`, createdAt: now, updatedAt: now });
        await db.insert(publicStatusMaster).values({
            id: publicStatusId,
            name: `test-status-${publicStatusId}`,
            createdAt: now,
            updatedAt: now,
        }).onConflictDoNothing();
        await db.insert(rankingMaster).values(rankingIds.map((id) => ({ id, userId, title: `test-ranking-${id}`, publicStatus: publicStatusId, createdAt: now, updatedAt: now })));
        await db.insert(tagMaster).values({ id: tagId, userId, name: "共有タグ", createdAt: now, updatedAt: now });
        await db.insert(rankingTagMaster).values(rankingIds.map((rankingId, index) => ({ id: rankingTagIds[index], rankingId, tagId, userId, createdAt: now, updatedAt: now })));

        const repository = new BulkSoftDeleteMyRankingRepository(db);
        const rankings = await repository.findRankings(UserId.of(userId), rankingIds.map((id) => RankingId.of(id)));
        expect(rankings.flatMap((e) => e.rankingTagEntityList.map((tag) => tag.id)).sort()).toEqual([...rankingTagIds].sort());

        rankings.forEach((ranking) => ranking.delete());
        await repository.deleteRankings(rankings);

        const links = await db.select().from(rankingTagMaster).where(inArray(rankingTagMaster.id, rankingTagIds));
        expect(links.every((e) => e.deleteFlg)).toBe(true);
    });
});
