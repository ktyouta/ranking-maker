import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { BulkSoftDeleteMyRankingUsecase } from "../../../application";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { RankingId, UserId } from "../../../domain";
import { BulkSoftDeleteMyRankingRepository } from "../../../infrastructure";
import { authMiddleware } from "../../../middleware";
import type { AppEnv } from "../../../types";
import { formatZodErrors } from "../../../util";
import { BulkSoftDeleteMyRankingResponseDto } from "../dto";
import { BulkSoftDeleteMyRankingSchema } from "../schema";

/**
 * ランキング一括削除(論理)
 */
const bulkSoftDeleteMyRanking = new Hono<AppEnv>().post(API_ENDPOINT.MY_RANKING_BULK_DELETE,
  authMiddleware,
  zValidator("json", BulkSoftDeleteMyRankingSchema, (result, c) => {
    if (!result.success) {
      return c.json({ message: "リクエストが不正です。", data: formatZodErrors(result.error) }, HTTP_STATUS.UNPROCESSABLE_ENTITY);
    }
  }),
  async (c) => {
    const db = c.get('db');
    const repository = new BulkSoftDeleteMyRankingRepository(db);
    const user = c.get("user");
    if (!user) {
      return c.json({ message: "認証エラー" }, HTTP_STATUS.UNAUTHORIZED);
    }
    const userId = UserId.of(user.userId.value);
    const { ids } = c.req.valid("json");
    const rankingIds = ids.map((id) => RankingId.of(id));
    const usecase = new BulkSoftDeleteMyRankingUsecase(repository);

    const result = await usecase.execute(userId, rankingIds);

    const dto = new BulkSoftDeleteMyRankingResponseDto(result);

    return c.json(dto.value, HTTP_STATUS.OK);
  });

export { bulkSoftDeleteMyRanking };
