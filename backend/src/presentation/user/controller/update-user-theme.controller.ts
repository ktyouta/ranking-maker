import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { UpdateUserThemeUsecase } from "../../../application";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { UpdateUserThemeRepository } from "../../../infrastructure";
import { authMiddleware, userOperationGuardMiddleware } from "../../../middleware";
import { UserIdParamSchema } from "../../../schema";
import type { AppEnv } from "../../../types";
import { formatZodErrors } from "../../../util";
import { UpdateUserThemeSchema } from "../schema";

const updateUserTheme = new Hono<AppEnv>().patch(
    `${API_ENDPOINT.USER_ID_THEME}`,
    userOperationGuardMiddleware,
    authMiddleware,
    zValidator("param", UserIdParamSchema, (result, c) => {
        if (!result.success) {
            return c.json({ message: "パラメータが不正です。", data: formatZodErrors(result.error) }, HTTP_STATUS.BAD_REQUEST);
        }
    }),
    zValidator("json", UpdateUserThemeSchema, (result, c) => {
        if (!result.success) {
            return c.json({ message: "バリデーションエラー", data: formatZodErrors(result.error) }, HTTP_STATUS.UNPROCESSABLE_ENTITY);
        }
    }),
    async (c) => {
        const { userId } = c.req.valid("param");
        const body = c.req.valid("json");
        const db = c.get('db');
        const repository = new UpdateUserThemeRepository(db);
        const usecase = new UpdateUserThemeUsecase(repository);

        const updated = await usecase.execute(userId, body.theme);

        if (!updated) {
            return c.json({ message: "テーマを更新できませんでした。" }, HTTP_STATUS.NOT_FOUND);
        }

        return c.json({ message: "テーマの更新が完了しました。" }, HTTP_STATUS.OK);
    }
);

export { updateUserTheme };
