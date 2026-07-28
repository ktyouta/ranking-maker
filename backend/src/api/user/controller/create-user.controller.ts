import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import {
    AccessToken,
    UserBirthday,
    UserId,
    UserName,
    UserPassword,
    UserSalt,
    Pepper,
    RefreshToken,
} from "../../../domain";
import { userLoginMaster, userMaster } from "../../../infrastructure/db";
import { userOperationGuardMiddleware } from "../../../middleware";
import type { AppEnv } from "../../../types";
import { formatZodErrors } from "../../../util";
import { CreateUserResponseDto } from "../dto";
import { UserEntity } from "../entity";
import { CreateUserRepository } from "../repository";
import { CreateUserSchema } from "../schema";

const createUser = new Hono<AppEnv>().post(
    API_ENDPOINT.USER,
    userOperationGuardMiddleware,
    zValidator("json", CreateUserSchema, (result, c) => {
        if (!result.success) {
            return c.json({ message: "バリデーションエラー", data: formatZodErrors(result.error) }, HTTP_STATUS.UNPROCESSABLE_ENTITY);
        }
    }),
    async (c) => {
        const body = c.req.valid("json");
        const db = c.get('db');
        const config = c.get('envConfig');
        const repository = new CreateUserRepository(db);

        const userName = new UserName(body.name);
        const userBirthday = new UserBirthday(body.birthday);
        const salt = UserSalt.generate();
        const pepper = new Pepper(config.pepper);
        const userPassword = await UserPassword.hash(body.password, salt, pepper);

        const existingUsers = await repository.findByUserName(userName);
        if (existingUsers.length > 0) {
            return c.json({ message: "既にユーザーが存在しています。" }, HTTP_STATUS.UNPROCESSABLE_ENTITY);
        }

        const userId = UserId.generate();
        const loginId = UserId.generate();
        const now = new Date().toISOString();

        await db.batch([
            db.insert(userLoginMaster).values({
                id: loginId.value,
                userId: userId.value,
                loginId: userName.value,
                passwordHash: userPassword.value,
                salt: salt.value,
                authProvider: "password",
                deleteFlg: false,
                createdAt: now,
                updatedAt: now,
            }),
            db.insert(userMaster).values({
                id: userId.value,
                name: userName.value,
                birthday: userBirthday.value,
                deleteFlg: false,
                createdAt: now,
                updatedAt: now,
            }),
        ]);

        const userEntity = new UserEntity(userId, userName, userBirthday);
        const accessToken = await AccessToken.create(userId, config);
        const refreshToken = await RefreshToken.create(userId, config);

        const responseDto = new CreateUserResponseDto(userEntity, accessToken.token);

        setCookie(c, RefreshToken.COOKIE_KEY, refreshToken.value, RefreshToken.getCookieSetOption(config));

        return c.json({ message: "ユーザー情報の登録が完了しました。", data: responseDto.value }, HTTP_STATUS.CREATED);
    }
);

export { createUser };
