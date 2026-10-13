import { Hono } from "hono";
import { GetTrashListMyRankingUsecase } from "../../../../application";
import { API_ENDPOINT, HTTP_STATUS } from "../../../../constant";
import { UserId } from "../../../../domain";
import { GetTrashListMyRankingRepository } from "../../../../infrastructure";
import { authMiddleware, validatorMiddleware } from "../../../../middleware";
import type { AppEnv } from "../../../../types";
import { toInputErrorMessage } from "../../error-message";
import { GetTrashListMyRankingQuerySchema } from "../../schema";

/**
 * ゴミ箱のランキング一覧取得
 */
const getTrashListMyRanking = new Hono<AppEnv>().get(API_ENDPOINT.MY_RANKING_TRASH,
  authMiddleware,
  validatorMiddleware("query", GetTrashListMyRankingQuerySchema),
  async (c) => {
    const db = c.get('db');
    const repository = new GetTrashListMyRankingRepository(db);
    const user = c.get("user");
    if (!user) {
      return c.json({ message: "認証エラー" }, HTTP_STATUS.UNAUTHORIZED);
    }
    const userId = UserId.of(user.userId.value);
    const query = c.req.valid("query");
    const usecase = new GetTrashListMyRankingUsecase(repository);

    const result = await usecase.execute({ userId, query });

    return result.match(
      // 成功
      (dto) => c.json({ message: "削除済みランキング一覧を取得しました。", data: dto.value }, HTTP_STATUS.OK),
      // 失敗
      (error) => {
        switch (error.type) {
          case "INVALID_INPUT":
            return c.json({ message: "入力エラー", data: error.errors.map((e) => ({ field: e.field, message: toInputErrorMessage(e.error) })) }, HTTP_STATUS.UNPROCESSABLE_ENTITY);
          default: {
            // 全てのエラー種別を網羅していることを型で保証する
            error.type satisfies never;
            return c.json({ message: "サーバーエラー" }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
          }
        }
      },
    );
  });

export { getTrashListMyRanking };
