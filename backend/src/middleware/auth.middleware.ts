import type { MiddlewareHandler } from "hono";
import { AuthRepository, AuthService } from "../auth";
import { HTTP_STATUS } from "../constant";
import { AccessToken } from "../domain";
import { Header } from "../domain/header";
import type { AppEnv } from "../types";


/**
 * 認証ミドルウェア
 */
export const authMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {

    try {

        const config = c.get('envConfig');
        const header = new Header(c.req.raw);
        const accessToken = AccessToken.get(header, config);

        const userId = await accessToken.getPayload();

        const db = c.get('db');
        const repository = new AuthRepository(db);
        const service = new AuthService(repository);

        const userInfo = await service.getUserById(userId);

        if (!userInfo) {
            return c.json({ message: "認証エラー" }, HTTP_STATUS.UNAUTHORIZED);
        }

        c.set("user", {
            userId,
            info: {
                id: userInfo.id,
                name: userInfo.name,
                birthday: userInfo.birthday,
            },
        });

        await next();
    } catch (err) {
        console.error("Auth error:", err);
        return c.json({ message: "認証エラー" }, HTTP_STATUS.UNAUTHORIZED);
    }
};
