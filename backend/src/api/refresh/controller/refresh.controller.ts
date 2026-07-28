import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { API_ENDPOINT, HTTP_STATUS } from "../../../constant";
import { AccessToken, Cookie, RefreshToken } from "../../../domain";
import type { AppEnv } from "../../../types";
import { RefreshRepository } from "../repository";
import { RefreshService } from "../service";

/**
 * トークンリフレッシュ
 * @route POST /api/v1/refresh
 */
const refresh = new Hono<AppEnv>().post(API_ENDPOINT.REFRESH, async (c) => {

    const config = c.get('envConfig');
    try {
        const db = c.get('db');
        const repository = new RefreshRepository(db);
        const service = new RefreshService(repository);
        const cookie = new Cookie(getCookie(c));
        const refreshToken = RefreshToken.get(cookie, config);

        // トークン検証・ユーザーID取得
        let userId;
        try {
            userId = await refreshToken.getPayload();
        } catch {
            console.warn("Refresh failed: リフレッシュトークンが無効です");
            setCookie(c, RefreshToken.COOKIE_KEY, "", RefreshToken.getCookieClearOption(config));
            return c.json({ message: "認証失敗" }, HTTP_STATUS.UNAUTHORIZED);
        }

        // ユーザー情報を取得
        const userInfo = await service.getUser(userId);
        if (!userInfo) {
            console.warn("Refresh failed: ユーザーが見つかりません");
            setCookie(c, RefreshToken.COOKIE_KEY, "", RefreshToken.getCookieClearOption(config));
            return c.json({ message: "認証失敗" }, HTTP_STATUS.UNAUTHORIZED);
        }

        // 絶対期限チェック
        const isExpired = await refreshToken.isAbsoluteExpired();
        if (isExpired) {
            console.warn("Refresh failed: リフレッシュトークンの絶対期限切れ");
            setCookie(c, RefreshToken.COOKIE_KEY, "", RefreshToken.getCookieClearOption(config));
            return c.json({ message: "認証失敗" }, HTTP_STATUS.UNAUTHORIZED);
        }

        // 新しいトークンを生成
        const newRefreshToken = await refreshToken.refresh();
        const accessToken = await AccessToken.create(userId, config);

        // 新しいリフレッシュトークンをCookieに設定
        setCookie(c, RefreshToken.COOKIE_KEY, newRefreshToken.value, RefreshToken.getCookieSetOption(config));

        return c.json({ message: "認証成功", data: accessToken.token }, 200);
    } catch (e) {
        console.warn(`Refresh failed: ${e}`);

        setCookie(c, RefreshToken.COOKIE_KEY, "", RefreshToken.getCookieClearOption(config));

        return c.json({ message: "認証失敗" }, HTTP_STATUS.UNAUTHORIZED);
    }
});

export { refresh };
