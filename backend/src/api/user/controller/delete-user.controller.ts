import { UserIdParamSchema } from "../../../schema";
import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { UserId, RefreshToken } from "../../../domain";
import { userLoginMaster, userMaster } from "../../../infrastructure/db";
import { authMiddleware, userOperationGuardMiddleware } from "../../../middleware";
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
        const userIdObj = UserId.of(userId);

        const now = new Date().toISOString();
        const [, deleteResult] = await db.batch([
            db.update(userLoginMaster)
                .set({ deleteFlg: true, updatedAt: now })
                .where(
                    and(
                        eq(userLoginMaster.userId, userIdObj.value),
                        eq(userLoginMaster.deleteFlg, false)
                    )
                ),
            db.update(userMaster)
                .set({ deleteFlg: true, updatedAt: now })
                .where(
                    and(
                        eq(userMaster.id, userIdObj.value),
                        eq(userMaster.deleteFlg, false)
                    )
                )
                .returning(),
        ]);
        const deleted = deleteResult.length > 0;

        if (!deleted) {
            return c.json({ message: "ユーザーが見つかりません。" }, HTTP_STATUS.NOT_FOUND);
        }

        setCookie(c, RefreshToken.COOKIE_KEY, "", RefreshToken.getCookieClearOption(config));

        return c.body(null, HTTP_STATUS.NO_CONTENT);
    }
);

export { deleteUser };
