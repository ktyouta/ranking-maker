import { UserIdParamSchema } from "../../../schema";
import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { UserBirthday, UserId, UserName, RefreshToken } from "../../../domain";
import { userLoginMaster, userMaster } from "../../../infrastructure/db";
import { authMiddleware, userOperationGuardMiddleware } from "../../../middleware";
import type { AppEnv } from "../../../types";
import { formatZodErrors } from "../../../util";
import { UpdateUserResponseDto } from "../dto";
import { UpdateUserRepository } from "../repository";
import { UpdateUserSchema } from "../schema";

const updateUser = new Hono<AppEnv>().patch(
    `${API_ENDPOINT.USER_ID}`,
    userOperationGuardMiddleware,
    authMiddleware,
    zValidator("param", UserIdParamSchema, (result, c) => {
        if (!result.success) {
            return c.json({ message: "パラメータが不正です。", data: formatZodErrors(result.error) }, HTTP_STATUS.BAD_REQUEST);
        }
    }),
    zValidator("json", UpdateUserSchema, (result, c) => {
        if (!result.success) {
            return c.json({ message: "バリデーションエラー", data: formatZodErrors(result.error) }, HTTP_STATUS.UNPROCESSABLE_ENTITY);
        }
    }),
    async (c) => {
        const { userId } = c.req.valid("param");
        const body = c.req.valid("json");
        const db = c.get('db');
        const config = c.get('envConfig');

        const userIdObj = UserId.of(userId);
        const userName = new UserName(body.name);
        const userBirthday = new UserBirthday(body.birthday);

        const repository = new UpdateUserRepository(db);
        if (await repository.checkUserNameExists(userIdObj, userName)) {
            return c.json({ message: "既にユーザーが存在しています。" }, HTTP_STATUS.UNPROCESSABLE_ENTITY);
        }

        const now = new Date().toISOString();
        const [, updateResult] = await db.batch([
            db.update(userLoginMaster)
                .set({ loginId: userName.value, updatedAt: now })
                .where(
                    and(
                        eq(userLoginMaster.userId, userIdObj.value),
                        eq(userLoginMaster.deleteFlg, false)
                    )
                ),
            db.update(userMaster)
                .set({
                    name: userName.value,
                    birthday: userBirthday.value,
                    updatedAt: now,
                })
                .where(
                    and(
                        eq(userMaster.id, userIdObj.value),
                        eq(userMaster.deleteFlg, false)
                    )
                )
                .returning(),
        ]);
        const updated = updateResult[0];

        if (!updated) {
            return c.json({ message: "ユーザーが見つかりません。" }, HTTP_STATUS.NOT_FOUND);
        }

        const refreshToken = await RefreshToken.create(userIdObj, config);

        const responseDto = new UpdateUserResponseDto(
            updated.id,
            updated.name,
            updated.birthday
        );

        setCookie(c, RefreshToken.COOKIE_KEY, refreshToken.value, RefreshToken.getCookieSetOption(config));

        return c.json({ message: "ユーザー情報の更新が完了しました。", data: responseDto.value }, HTTP_STATUS.OK);
    }
);

export { updateUser };
