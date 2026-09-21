import { drizzle } from "drizzle-orm/d1";
import { env } from "cloudflare:test";
import { ulid } from "ulid";
import { describe, expect, it } from "vitest";
import { RankingSort, RankingSortType } from "../../../../src/domain/my-ranking";
import { UserId } from "../../../../src/domain/user";
import type { Database } from "../../../../src/infrastructure/db";
import * as schema from "../../../../src/infrastructure/db/schema";
import { publicStatusMaster, rankingMaster, rankingOrderMaster, userMaster } from "../../../../src/infrastructure/db/schema";
import { GetListMyRankingRepository } from "../../../../src/infrastructure/my-ranking/repository/get-list-my-ranking.repository";

type RankingSeed = {
    title: string;
    createdAt: string;
    updatedAt: string;
    isFavorite?: boolean;
    itemCount?: number;
};

/**
 * ユーザーとランキングを登録する（挿入順 = 引数の並び順。ulid は挿入順に昇順になる）
 */
async function seedRankings(db: Database, seeds: RankingSeed[]) {
    const now = new Date().toISOString();
    const userId = ulid();
    const publicStatusId = 1;

    await db.insert(userMaster).values({ id: userId, name: `test-user-${userId}`, createdAt: now, updatedAt: now });
    await db.insert(publicStatusMaster).values({
        id: publicStatusId,
        name: `test-status-${publicStatusId}`,
        createdAt: now,
        updatedAt: now,
    }).onConflictDoNothing();

    for (const seed of seeds) {
        const rankingId = ulid();
        await db.insert(rankingMaster).values({
            id: rankingId,
            userId,
            title: seed.title,
            publicStatus: publicStatusId,
            isFavorite: seed.isFavorite ?? false,
            createdAt: seed.createdAt,
            updatedAt: seed.updatedAt,
        });
        for (let order = 1; order <= (seed.itemCount ?? 0); order++) {
            await db.insert(rankingOrderMaster).values({
                id: ulid(),
                rankingId,
                order,
                itemName: `item-${order}`,
                createdAt: seed.createdAt,
                updatedAt: seed.updatedAt,
            });
        }
    }
    return UserId.of(userId);
}

async function findTitles(db: Database, userId: UserId, sort: RankingSortType) {
    const repository = new GetListMyRankingRepository(db);
    const result = await repository.findAll(userId, { sort: new RankingSort(sort), page: 1 });
    return result.map((e) => e.title);
}

describe("GetListMyRankingRepository", () => {

    // 挿入順（A→B→C）と各日付の並びが食い違うデータにして、id ではなく指定カラムで並ぶことを検証する
    const seeds: RankingSeed[] = [
        { title: "A", createdAt: "2026-01-02T00:00:00.000Z", updatedAt: "2026-02-01T00:00:00.000Z", itemCount: 2 },
        { title: "B", createdAt: "2026-01-03T00:00:00.000Z", updatedAt: "2026-02-03T00:00:00.000Z", itemCount: 0 },
        { title: "C", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-02-02T00:00:00.000Z", itemCount: 1 },
    ];

    it("findAll: updatedAtDesc は更新日が新しい順に返る", async () => {
        const db = drizzle(env.DB, { schema });
        const userId = await seedRankings(db, seeds);

        expect(await findTitles(db, userId, "updatedAtDesc")).toEqual(["B", "C", "A"]);
    });

    it("findAll: updatedAtAsc は更新日が古い順に返る", async () => {
        const db = drizzle(env.DB, { schema });
        const userId = await seedRankings(db, seeds);

        expect(await findTitles(db, userId, "updatedAtAsc")).toEqual(["A", "C", "B"]);
    });

    it("findAll: createdAtDesc は登録日が新しい順に返る", async () => {
        const db = drizzle(env.DB, { schema });
        const userId = await seedRankings(db, seeds);

        expect(await findTitles(db, userId, "createdAtDesc")).toEqual(["B", "A", "C"]);
    });

    it("findAll: createdAtAsc は登録日が古い順に返る", async () => {
        const db = drizzle(env.DB, { schema });
        const userId = await seedRankings(db, seeds);

        expect(await findTitles(db, userId, "createdAtAsc")).toEqual(["C", "A", "B"]);
    });

    it("findAll: itemCountDesc は項目数が多い順に返る", async () => {
        const db = drizzle(env.DB, { schema });
        const userId = await seedRankings(db, seeds);

        expect(await findTitles(db, userId, "itemCountDesc")).toEqual(["A", "C", "B"]);
    });

    it("findAll: itemCountAsc は項目数が少ない順に返る", async () => {
        const db = drizzle(env.DB, { schema });
        const userId = await seedRankings(db, seeds);

        expect(await findTitles(db, userId, "itemCountAsc")).toEqual(["B", "C", "A"]);
    });

    it("findAll: 項目数が同じ場合は更新日が新しい順に返る", async () => {
        const db = drizzle(env.DB, { schema });
        const userId = await seedRankings(db, [
            { title: "old", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-02-01T00:00:00.000Z", itemCount: 1 },
            { title: "new", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-02-02T00:00:00.000Z", itemCount: 1 },
        ]);

        expect(await findTitles(db, userId, "itemCountDesc")).toEqual(["new", "old"]);
        expect(await findTitles(db, userId, "itemCountAsc")).toEqual(["new", "old"]);
    });

    it("findAll: favoriteDesc はお気に入りが先頭になり、それぞれ更新日が新しい順に返る", async () => {
        const db = drizzle(env.DB, { schema });
        const userId = await seedRankings(db, [
            { title: "normal-old", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-02-01T00:00:00.000Z" },
            { title: "favorite-old", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-02-02T00:00:00.000Z", isFavorite: true },
            { title: "normal-new", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-02-04T00:00:00.000Z" },
            { title: "favorite-new", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-02-03T00:00:00.000Z", isFavorite: true },
        ]);

        expect(await findTitles(db, userId, "favoriteDesc")).toEqual(["favorite-new", "favorite-old", "normal-new", "normal-old"]);
    });

    it("findAll: 並び替えの第一キーが同値でも、ページをまたいで重複・欠落しない", async () => {
        const db = drizzle(env.DB, { schema });
        const total = GetListMyRankingRepository.LIMIT + 1;
        const sameDate = "2026-02-01T00:00:00.000Z";
        const userId = await seedRankings(
            db,
            Array.from({ length: total }, (_, i) => ({ title: `same-${i}`, createdAt: sameDate, updatedAt: sameDate })),
        );

        const repository = new GetListMyRankingRepository(db);
        const sort = new RankingSort("updatedAtDesc");
        const page1 = await repository.findAll(userId, { sort, page: 1 });
        const page2 = await repository.findAll(userId, { sort, page: 2 });

        const ids = [...page1, ...page2].map((e) => e.id);
        expect(page1).toHaveLength(GetListMyRankingRepository.LIMIT);
        expect(page2).toHaveLength(1);
        expect(new Set(ids).size).toBe(total);
        expect(ids).toEqual([...ids].sort().reverse());
    });
});
