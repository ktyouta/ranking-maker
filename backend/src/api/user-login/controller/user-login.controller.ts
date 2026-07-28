import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import {
    AccessToken,
    UserId,
    UserName,
    UserPassword,
    UserSalt,
    Pepper,
    RefreshToken,
} from "../../../domain";
import type { AppEnv } from "../../../types";
import { formatZodErrors } from "../../../util";
import { UserLoginResponseDto } from "../dto";
import { UserLoginRepository } from "../repository";
import { UserLoginSchema } from "../schema";
import { UserLoginService } from "../service";

const userLogin = new Hono<AppEnv>().post(
    API_ENDPOINT.USER_LOGIN,
    zValidator("json", UserLoginSchema, (result, c) => {
        if (!result.success) {
            return c.json({ message: "バリデーションエラー", data: formatZodErrors(result.error) }, HTTP_STATUS.UNPROCESSABLE_ENTITY);
        }
    }),
    async (c) => {
        const body = c.req.valid("json");
        const db = c.get('db');
        const config = c.get('envConfig');
        const repository = new UserLoginRepository(db);
        const service = new UserLoginService(repository);

        const loginId = new UserName(body.name);
        const loginInfo = await service.getLoginUser(loginId);

        if (!loginInfo) {
            return c.json({ message: "IDかパスワードが間違っています。" }, HTTP_STATUS.UNAUTHORIZED);
        }

        const salt = UserSalt.of(loginInfo.salt);
        const pepper = new Pepper(config.pepper);
        const password = await UserPassword.hash(body.password, salt, pepper);

        if (!service.isMatchPassword(password, loginInfo)) {
            return c.json({ message: "IDかパスワードが間違っています。" }, HTTP_STATUS.UNAUTHORIZED);
        }

        // loginInfo.userId が user_master の id
        const userId = UserId.of(loginInfo.userId);
        const userInfo = await service.getUserInfo(userId);

        if (!userInfo) {
            return c.json({ message: "IDかパスワードが間違っています。" }, HTTP_STATUS.UNAUTHORIZED);
        }

        const accessToken = await AccessToken.create(userId, config);
        const refreshToken = await RefreshToken.create(userId, config);

        await service.updateLastLoginDate(userId);

        const responseDto = new UserLoginResponseDto(userInfo, accessToken.token);

        setCookie(c, RefreshToken.COOKIE_KEY, refreshToken.value, RefreshToken.getCookieSetOption(config));

        return c.json({ message: "ログイン成功", data: responseDto.value }, HTTP_STATUS.OK);
    }
);

export { userLogin };
