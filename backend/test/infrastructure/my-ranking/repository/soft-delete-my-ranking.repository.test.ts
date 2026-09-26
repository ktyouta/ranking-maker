import { drizzle } from "drizzle-orm/d1";
import { env } from "cloudflare:test";
import { eq } from "drizzle-orm";
import { ulid } from "ulid";
import { describe, expect, it } from "vitest";
import { RankingId, UserId } from "../../../../src/domain/shared";
import * as schema from "../../../../src/infrastructure/db/schema";
import { publicStatusMaster, rankingMaster, rankingOrderMaster, rankingTagMaster, tagMaster, userMaster } from "../../../../src/infrastructure/db/schema";
import { SoftDeleteMyRankingRepository } from "../../../../src/infrastructure/my-ranking/repository/soft-delete-my-ranking.repository";

describe("SoftDeleteMyRankingRepository", () => {

    it("findRanking→delete→deleteRanking: 生存しているタグ付けを集約に含め、集約の削除状態をタグ付けに反映すること", async () => {
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
        await db.insert(rankingMaster).values({ id: rankingId, userId, title: `test-ranking-${rankingId}`, publicStatus: publicStatusId, createdAt: now, updatedAt: now });
        await db.insert(tagMaster).values({ id: tagId, userId, name: "タグ", createdAt: now, updatedAt: now });
        await db.insert(rankingTagMaster).values({ id: rankingTagId, rankingId, tagId, userId, createdAt: now, updatedAt: now });

        const repository = new SoftDeleteMyRankingRepository(db);
        const ranking = await repository.findRanking(UserId.of(userId), RankingId.of(rankingId));
        if (!ranking) {
            throw new Error("unexpected null");
        }
        expect(ranking.rankingTagEntityList.map((e) => e.id)).toEqual([rankingTagId]);

        ranking.delete();
        await repository.deleteRanking(ranking);

        const links = await db.select().from(rankingTagMaster).where(eq(rankingTagMaster.id, rankingTagId));
        expect(links[0]?.deleteFlg).toBe(true);
    });

    // 回帰テスト: findRanking の項目取得条件が deleteFlg=true になっていたバグの修正確認
    // （削除前の生存ランキングを取得する処理のため、本来は deleteFlg=false の項目のみ返すべき）
    it("findRanking: 削除前の生存している項目のみが集約に含まれること", async () => {
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
        await db.insert(rankingOrderMaster).values([
            { id: ulid(), rankingId, order: 1, itemName: "生存中の項目", deleteFlg: false, createdAt: now, updatedAt: now },
            { id: ulid(), rankingId, order: 2, itemName: "既に削除済みの項目", deleteFlg: true, createdAt: now, updatedAt: now },
        ]);

        const repository = new SoftDeleteMyRankingRepository(db);
        const result = await repository.findRanking(UserId.of(userId), RankingId.of(rankingId));

        expect(result?.rankingOrderEntityList).toHaveLength(1);
        expect(result?.rankingOrderEntityList[0].itemName).toBe("生存中の項目");
    });
});
