import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { DeleteUserUsecase } from "../../../application";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { RefreshToken } from "../../../domain";
import { DeleteUserRepository } from "../../../infrastructure";
import { authMiddleware, userOperationGuardMiddleware } from "../../../middleware";
import { UserIdParamSchema } from "../../../schema";
import type { AppEnv } from "../../../types";
import { formatZodErrors } from "../../../util";

const deleteUser = new Hono<AppEnv>().delete(
    `${API_ENDPOINT.USER_ID}`,
    userOperationGuardMiddleware,
    authMiddleware,
    zValidator("param", UserIdParamSchema, (result, c) => {
        if (!result.success) {
            return c.json({ message: "パラメータが不正です。", data: formatZodErrors(result.error) }, HTTP_STATUS.BAD_REQUEST);
        }
    }),
    async (c) => {
        const { userId } = c.req.valid("param");
        const db = c.get('db');
        const config = c.get('envConfig');
        const repository = new DeleteUserRepository(db);
        const usecase = new DeleteUserUsecase(repository);

        const deleted = await usecase.execute(userId);

        if (!deleted) {
            return c.json({ message: "ユーザーが見つかりません。" }, HTTP_STATUS.NOT_FOUND);
        }

        setCookie(c, RefreshToken.COOKIE_KEY, "", RefreshToken.getCookieClearOption(config));

        return c.body(null, HTTP_STATUS.NO_CONTENT);
    }
);

export { deleteUser };
