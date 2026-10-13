import { Hono } from "hono";
import { UpdateUserThemeUsecase } from "../../../../application";
import { API_ENDPOINT, HTTP_STATUS } from "../../../../constant";
import { UpdateUserThemeRepository } from "../../../../infrastructure";
import { authMiddleware, validatorMiddleware } from "../../../../middleware";
import type { AppEnv } from "../../../../types";
import { toInputErrorMessage } from "../../error-message";
import { UpdateUserThemeSchema } from "../../schema";

const updateUserTheme = new Hono<AppEnv>().patch(
    API_ENDPOINT.USER_THEME,
    authMiddleware,
    validatorMiddleware("json", UpdateUserThemeSchema),
    async (c) => {
        const user = c.get("user");
        if (!user) {
            return c.json({ message: "認証エラー" }, HTTP_STATUS.UNAUTHORIZED);
        }
        const body = c.req.valid("json");
        const db = c.get('db');
        const repository = new UpdateUserThemeRepository(db);
        const usecase = new UpdateUserThemeUsecase(repository);

        const result = await usecase.execute({ userId: user.userId, theme: body.theme });

        if (result.isErr()) {
            const error = result.error;
            switch (error.type) {
                case "INVALID_INPUT":
                    return c.json({ message: "入力エラー", data: error.errors.map((e) => ({ field: e.field, message: toInputErrorMessage(e.error) })) }, HTTP_STATUS.UNPROCESSABLE_ENTITY);
                case "NOT_FOUND":
                    return c.json({ message: "テーマを更新できませんでした。" }, HTTP_STATUS.NOT_FOUND);
                default: {
                    // 全てのエラー種別を網羅していることを型で保証する
                    error satisfies never;
                    return c.json({ message: "サーバーエラー" }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
                }
            }
        }

        return c.json({ message: "テーマの更新が完了しました。" }, HTTP_STATUS.OK);
    }
);

export { updateUserTheme };
