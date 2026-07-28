import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { AccessToken, Cookie, RefreshToken } from "../../../domain";
import type { AppEnv } from "../../../types";
import { VerifyRepository } from "../repository/verify.repository";
import { VerifyService } from "../service/verify.service";


/**
 * 認証チェック
 * @route GET /api/v1/verify
 */
const verify = new Hono<AppEnv>().get(
    API_ENDPOINT.VERIFY,
    async (c) => {
        const config = c.get('envConfig');
        try {
            const db = c.get('db');
            const repository = new VerifyRepository(db);
            const service = new VerifyService(repository);
            const cookie = new Cookie(getCookie(c));
            const refreshToken = RefreshToken.get(cookie, config);

            // トークン検証・ユーザーID取得
            const userId = await refreshToken.getPayload();

            // ユーザー情報を取得
            const userInfo = await service.getUser(userId);

            if (!userInfo) {
                console.warn("verify failed: ユーザーが見つかりません");
                setCookie(c, RefreshToken.COOKIE_KEY, "", RefreshToken.getCookieClearOption(config));
                return c.json({ message: "認証失敗" }, HTTP_STATUS.UNAUTHORIZED);
            }

            // 絶対期限チェック
            const isExpired = await refreshToken.isAbsoluteExpired();
            if (isExpired) {
                console.warn("verify failed: リフレッシュトークンの絶対期限切れ");
                setCookie(c, RefreshToken.COOKIE_KEY, "", RefreshToken.getCookieClearOption(config));
                return c.json({ message: "認証失敗" }, HTTP_STATUS.UNAUTHORIZED);
            }

            // 新しいトークンを生成
            const accessToken = await AccessToken.create(userId, config);

            return c.json({
                message: "認証成功",
                data: {
                    accessToken: accessToken.token,
                    userInfo: {
                        id: userInfo.id,
                        name: userInfo.name,
                        birthday: userInfo.birthday,
                    },
                },
            }, 200);
        } catch (e) {
            console.warn(`Refresh failed: ${e}`);

            setCookie(c, RefreshToken.COOKIE_KEY, "", RefreshToken.getCookieClearOption(config));

            return c.json({ message: "認証失敗" }, HTTP_STATUS.UNAUTHORIZED);
        }
    }
);

export { verify };
