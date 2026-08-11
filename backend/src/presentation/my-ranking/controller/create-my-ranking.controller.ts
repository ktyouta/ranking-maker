import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { CreateMyRankingUsecase } from "../../../application/my-ranking/usecase/create-my-ranking.usecase";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { RankingTitleUniquenessDomainService, UserId } from "../../../domain";
import { RankingTitleUniquenessRepository } from "../../../infrastructure/my-ranking";
import { CreateMyRankingRepository } from "../../../infrastructure/my-ranking/repository/create-my-ranking.repository";
import { authMiddleware } from "../../../middleware";
import type { AppEnv } from "../../../types";
import { formatZodErrors } from "../../../util";
import { CreateMyRankingResponseDto } from "../dto";
import { CreateMyRankingSchema } from "../schema";

/**
 * ランキング作成
 */
const createMyRanking = new Hono<AppEnv>().post(API_ENDPOINT.MY_RANKING,
  authMiddleware,
  zValidator("json", CreateMyRankingSchema, (result, c) => {
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
    const body = c.req.valid("json");
    const uniquenessService = new RankingTitleUniquenessDomainService(new RankingTitleUniquenessRepository(db));
    const service = new CreateMyRankingUsecase(new CreateMyRankingRepository(db), uniquenessService);

    const result = await service.execute({ userId, body });

    return result.match(
      // 成功
      (aggregate) => c.json(
        { message: "ランキングを作成しました。", data: new CreateMyRankingResponseDto(aggregate).value },
        HTTP_STATUS.CREATED,
      ),
      // 失敗
      (error) => {
        switch (error.type) {
          case "VALIDATION":
            return c.json({ message: "入力エラー", data: error.violations }, HTTP_STATUS.UNPROCESSABLE_ENTITY);
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

export { createMyRanking };
