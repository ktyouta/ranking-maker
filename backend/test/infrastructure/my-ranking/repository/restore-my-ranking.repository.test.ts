import { drizzle } from "drizzle-orm/d1";
import { env } from "cloudflare:test";
import { eq } from "drizzle-orm";
import { ulid } from "ulid";
import { describe, expect, it } from "vitest";
import { RankingId, UserId } from "../../../../src/domain/shared";
import * as schema from "../../../../src/infrastructure/db/schema";
import { publicStatusMaster, rankingMaster, rankingTagMaster, tagMaster, userMaster } from "../../../../src/infrastructure/db/schema";
import { RestoreMyRankingRepository } from "../../../../src/infrastructure/my-ranking/repository/restore-my-ranking.repository";

describe("RestoreMyRankingRepository", () => {

    it("findRanking→restore→restoreRanking: 削除済みのタグ付けを集約に含め、集約の復元状態をタグ付けに反映すること", async () => {
        const db = drizzle(env.DB, { schema });
        const now = new Date().toISOString();
        const userId = ulid();
        const publicStatusId = 1;
        const rankingId = ulid();
        const tagId = ulid();
        const rankingTagId = ulid();

        await db.insert(userMaster).values({ id: userId, name: `test-user-${userId}`, createdAt: now, updatedAt: now });
        await db.insert(publicStatusMaster).values({
            id: publicStatusId,
            name: `test-status-${publicStatusId}`,
            createdAt: now,
            updatedAt: now,
        }).onConflictDoNothing();
        await db.insert(rankingMaster).values({ id: rankingId, userId, title: `test-ranking-${rankingId}`, publicStatus: publicStatusId, deleteFlg: true, createdAt: now, updatedAt: now });
        await db.insert(tagMaster).values({ id: tagId, userId, name: "タグ", createdAt: now, updatedAt: now });
        await db.insert(rankingTagMaster).values({ id: rankingTagId, rankingId, tagId, userId, deleteFlg: true, createdAt: now, updatedAt: now });

        const repository = new RestoreMyRankingRepository(db);
        const ranking = await repository.findRanking(UserId.of(userId), RankingId.of(rankingId));
        if (!ranking) {
            throw new Error("unexpected null");
        }
        expect(ranking.rankingTagEntityList.map((e) => e.id)).toEqual([rankingTagId]);

        ranking.restore();
        await repository.restoreRanking(ranking);

        const links = await db.select().from(rankingTagMaster).where(eq(rankingTagMaster.id, rankingTagId));
        expect(links[0]?.deleteFlg).toBe(false);
    });
});
