import { drizzle } from "drizzle-orm/d1";
import { env } from "cloudflare:test";
import { eq } from "drizzle-orm";
import { ulid } from "ulid";
import { describe, expect, it } from "vitest";
import { TagId, TagUsageDomainService } from "../../../../src/domain/my-ranking";
import { RankingId, UserId } from "../../../../src/domain/shared";
import type { Database } from "../../../../src/infrastructure/db";
import * as schema from "../../../../src/infrastructure/db/schema";
import { publicStatusMaster, rankingMaster, rankingTagMaster, tagMaster, userMaster } from "../../../../src/infrastructure/db/schema";
import { PermanentDeleteMyRankingRepository } from "../../../../src/infrastructure/my-ranking/repository/permanent-delete-my-ranking.repository";
import { TagUsageRepository } from "../../../../src/infrastructure/my-ranking/repository/tag-usage.repository";

/**
 * ゴミ箱内のランキングと、タグを共有する生存ランキングを登録する
 */
async function seed(db: Database) {
    const now = new Date().toISOString();
    const publicStatusId = 1;

    const userId = ulid();
    const rankingId = ulid();
    const otherRankingId = ulid();
    const onlyTagId = ulid();
    const sharedTagId = ulid();

    await db.insert(userMaster).values({ id: userId, name: `test-user-${userId}`, createdAt: now, updatedAt: now });
    await db.insert(publicStatusMaster).values({
        id: publicStatusId,
        name: `test-status-${publicStatusId}`,
        createdAt: now,
        updatedAt: now,
    }).onConflictDoNothing();
    await db.insert(rankingMaster).values([
        { id: rankingId, userId, title: `test-ranking-${rankingId}`, publicStatus: publicStatusId, deleteFlg: true, createdAt: now, updatedAt: now },
        { id: otherRankingId, userId, title: `test-ranking-${otherRankingId}`, publicStatus: publicStatusId, createdAt: now, updatedAt: now },
    ]);
    await db.insert(tagMaster).values([
        { id: onlyTagId, userId, name: "このランキングだけのタグ", createdAt: now, updatedAt: now },
        { id: sharedTagId, userId, name: "共有タグ", createdAt: now, updatedAt: now },
    ]);
    await db.insert(rankingTagMaster).values([
        { id: ulid(), rankingId, tagId: onlyTagId, userId, deleteFlg: true, createdAt: now, updatedAt: now },
        { id: ulid(), rankingId, tagId: sharedTagId, userId, deleteFlg: true, createdAt: now, updatedAt: now },
        { id: ulid(), rankingId: otherRankingId, tagId: sharedTagId, userId, createdAt: now, updatedAt: now },
    ]);

    return { userId, rankingId, onlyTagId, sharedTagId };
}

describe("PermanentDeleteMyRankingRepository", () => {

    it("findRanking→releaseTagsOnPermanentDelete→deleteRanking: タグ付けを削除し、未使用と判定されたタグだけを削除すること", async () => {
        const db = drizzle(env.DB, { schema });
        const { userId, rankingId, onlyTagId, sharedTagId } = await seed(db);

        const repository = new PermanentDeleteMyRankingRepository(db);
        const ranking = await repository.findRanking(UserId.of(userId), RankingId.of(rankingId));
        if (!ranking) {
            throw new Error("unexpected null");
        }
        const releasedTagIds = ranking.releaseTagsOnPermanentDelete();
        expect(releasedTagIds.map((e) => e.value).sort()).toEqual([onlyTagId, sharedTagId].sort());

        const tagUsageService = new TagUsageDomainService(new TagUsageRepository(db));
        const unusedTagIds = await tagUsageService.findUnused({ userId: UserId.of(userId), rankingId: RankingId.of(rankingId), releasedTagIds });
        expect(unusedTagIds.map((e) => e.value)).toEqual([onlyTagId]);

        await repository.deleteRanking(ranking, unusedTagIds);

        const links = await db.select().from(rankingTagMaster).where(eq(rankingTagMaster.rankingId, rankingId));
        expect(links).toHaveLength(0);

        const tags = await db.select({ id: tagMaster.id }).from(tagMaster).where(eq(tagMaster.userId, userId));
        expect(tags.map((e) => e.id)).toEqual([sharedTagId]);
    });

    it("deleteRanking: 未使用として渡されたタグでも、他のランキングに紐づいているものは削除しないこと", async () => {
        const db = drizzle(env.DB, { schema });
        const { userId, rankingId, sharedTagId } = await seed(db);

        const repository = new PermanentDeleteMyRankingRepository(db);
        const ranking = await repository.findRanking(UserId.of(userId), RankingId.of(rankingId));
        if (!ranking) {
            throw new Error("unexpected null");
        }
        await repository.deleteRanking(ranking, [TagId.of(sharedTagId)]);

        const tags = await db.select({ id: tagMaster.id }).from(tagMaster).where(eq(tagMaster.id, sharedTagId));
        expect(tags).toHaveLength(1);
    });
});
