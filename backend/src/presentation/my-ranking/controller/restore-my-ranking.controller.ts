import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { RestoreMyRankingUsecase } from "../../../application/my-ranking/usecase/restore-my-ranking.usecase";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { RankingId, RankingTitleUniquenessDomainService, UserId } from "../../../domain";
import { RankingTitleUniquenessRepository, RestoreMyRankingRepository } from "../../../infrastructure";
import { authMiddleware } from "../../../middleware";
import { RankingIdParamSchema } from "../../../schema/ranking-id-param.schema";
import type { AppEnv } from "../../../types";
import { formatZodErrors } from "../../../util";
import { RestoreMyRankingResponseDto } from "../dto";

/**
 * ランキング復元
 */
const restoreMyRanking = new Hono<AppEnv>().patch(API_ENDPOINT.MY_RANKING_TRASH_ID_RESTORE,
  authMiddleware,
  zValidator("param", RankingIdParamSchema, (result, c) => {
    if (!result.success) {
      return c.json({ message: result.error.message, data: formatZodErrors(result.error) }, HTTP_STATUS.BAD_REQUEST);
    }
  }),
  async (c) => {
    const db = c.get('db');
    const repository = new RestoreMyRankingRepository(db);
    const user = c.get("user");
    if (!user) {
      return c.json({ message: "認証エラー" }, HTTP_STATUS.UNAUTHORIZED);
    }
    const userId = UserId.of(user.userId.value);
    const rankingId = RankingId.of(c.req.valid("param").rankingId);
    const uniquenessService = new RankingTitleUniquenessDomainService(new RankingTitleUniquenessRepository(db));
    const usecase = new RestoreMyRankingUsecase(repository, uniquenessService);

    const result = await usecase.execute(userId, rankingId);

    return result.match(
      // 成功
      (aggregate) => c.json(
        { message: "ランキングを復元しました。", data: new RestoreMyRankingResponseDto(aggregate).value },
        HTTP_STATUS.OK,
      ),
      // 失敗
      (error) => {
        switch (error.type) {
          case "NOT_FOUND":
            return c.json({ message: "復元対象のランキングが存在しません。" }, HTTP_STATUS.NOT_FOUND);
          case "DUPLICATE_TITLE":
            return c.json({ message: "同名のランキングが存在します。" }, HTTP_STATUS.CONFLICT);
          default: {
            const _: never = error;
            return c.json({ message: "サーバーエラー" }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
          }
        }
      },
    );
  });

export { restoreMyRanking };
