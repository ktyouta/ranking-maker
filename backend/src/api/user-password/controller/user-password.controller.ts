import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { UserId, UserPassword, UserSalt, Pepper } from "../../../domain";
import { authMiddleware, userOperationGuardMiddleware } from "../../../middleware";
import { UserIdParamSchema } from "../../../schema";
import type { AppEnv } from "../../../types";
import { formatZodErrors } from "../../../util";
import { UserPasswordRepository } from "../repository";
import { UserPasswordSchema } from "../schema";
import { UserPasswordService } from "../service/user-password.service";

const userPassword = new Hono<AppEnv>().patch(
    `${API_ENDPOINT.USER_PASSWORD}`,
    userOperationGuardMiddleware,
    authMiddleware,
    zValidator("param", UserIdParamSchema, (result, c) => {
        if (!result.success) {
            return c.json({ message: "パラメータが不正です。", data: formatZodErrors(result.error) }, HTTP_STATUS.BAD_REQUEST);
        }
    }),
    zValidator("json", UserPasswordSchema, (result, c) => {
        if (!result.success) {
            return c.json({ message: "バリデーションエラー", data: formatZodErrors(result.error) }, HTTP_STATUS.UNPROCESSABLE_ENTITY);
        }
    }),
    async (c) => {
        const { userId } = c.req.valid("param");
        const body = c.req.valid("json");
        const db = c.get('db');
        const config = c.get('envConfig');
        const repository = new UserPasswordRepository(db);
        const service = new UserPasswordService(repository);
        const userIdObj = UserId.of(userId);

        const loginInfo = await service.getLoginUser(userIdObj);

        if (!loginInfo) {
            return c.json({ message: "パスワードの更新に失敗しました。" }, HTTP_STATUS.UNAUTHORIZED);
        }

        const pepper = new Pepper(config.pepper);
        const salt = UserSalt.of(loginInfo.salt);
        const nowPassword = await UserPassword.hash(body.nowPassword, salt, pepper);

        if (!service.isMatchPassword(nowPassword, loginInfo)) {
            return c.json({ message: "パスワードの更新に失敗しました。" }, HTTP_STATUS.UNAUTHORIZED);
        }

        const updateResult = await service.updateLoginUser(
            userIdObj,
            await UserPassword.hash(body.newPassword, salt, pepper)
        );

        if (!updateResult) {
            return c.json({ message: "パスワードの更新に失敗しました。" }, HTTP_STATUS.UNAUTHORIZED);
        }

        return c.json({ message: "パスワードの更新に成功しました。" }, HTTP_STATUS.OK);
    }
);

export { userPassword };
