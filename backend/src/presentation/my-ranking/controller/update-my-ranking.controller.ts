import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { UpdateMyRankingUsecase } from "../../../application";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { RankingId, RankingTitleUniquenessDomainService, UserId } from "../../../domain";
import { RankingTitleUniquenessRepository, UpdateMyRankingRepository } from "../../../infrastructure";
import { authMiddleware } from "../../../middleware";
import { RankingIdParamSchema } from "../../../schema";
import type { AppEnv } from "../../../types";
import { formatZodErrors } from "../../../util";
import { UpdateMyRankingResponseDto } from "../dto";
import { UpdateMyRankingSchema } from "../schema";

/**
 * ランキング更新
 */
const updateMyRanking = new Hono<AppEnv>().patch(API_ENDPOINT.MY_RANKING,
  authMiddleware,
  zValidator("param", RankingIdParamSchema, (result, c) => {
    if (!result.success) {
      return c.json({ message: result.error.message, data: formatZodErrors(result.error) }, HTTP_STATUS.BAD_REQUEST);
    }
  }),
  zValidator("json", UpdateMyRankingSchema, (result, c) => {
    if (!result.success) {
      return c.json({ message: "バリデーションエラー", data: formatZodErrors(result.error) }, HTTP_STATUS.UNPROCESSABLE_ENTITY);
    }
  }),
  async (c) => {
    const db = c.get('db');
    const user = c.get("user");
    if (!user) {
      return c.json({ message: "認証エラー" }, HTTP_STATUS.UNAUTHORIZED);
    }
    const userId = UserId.of(user.userId.value);
    const rankingId = RankingId.of(c.req.valid("param").rankingId);
    const body = c.req.valid("json");
    const uniquenessService = new RankingTitleUniquenessDomainService(new RankingTitleUniquenessRepository(db));
    const service = new UpdateMyRankingUsecase(new UpdateMyRankingRepository(db), uniquenessService);

    const result = await service.execute({ userId, rankingId, body });

    return result.match(
      // 成功
      (aggregate) => c.json(
        { message: "ランキングを更新しました。", data: new UpdateMyRankingResponseDto(aggregate).value },
        HTTP_STATUS.OK,
      ),
      // 失敗
      (error) => {
        switch (error.type) {
          case "VALIDATION":
            return c.json({ message: "入力エラー", data: error.violations }, HTTP_STATUS.UNPROCESSABLE_ENTITY);
          case "NOT_FOUND":
            return c.json({ message: "更新対象のランキングが存在しません。" }, HTTP_STATUS.NOT_FOUND);
          case "DUPLICATE_TITLE":
            return c.json({ message: "同名のランキングが既に存在します。" }, HTTP_STATUS.CONFLICT);
          default: {
            const _: never = error;
            return c.json({ message: "サーバーエラー" }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
          }
        }
      },
    );
  });

export { updateMyRanking };
