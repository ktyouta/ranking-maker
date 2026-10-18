import { Hono } from "hono";
import type { AppEnv } from "../../../../types";
import { createUser } from "../create-user/create-user.controller";
import { updateUser } from "../update-user/update-user.controller";
import { updateUserTheme } from "../update-user-theme/update-user-theme.controller";
import { updatePassword } from "../update-password/update-password.controller";
import { deleteUser } from "../delete-user/delete-user.controller";
import { userLogin } from "../user-login/user-login.controller";
import { refresh } from "../refresh/refresh.controller";
import { verify } from "../verify/verify.controller";
import { userLogout } from "../user-logout/user-logout.controller";

const user = new Hono<AppEnv>()
    .route("/", createUser)
    .route("/", updateUser)
    .route("/", updateUserTheme)
    .route("/", updatePassword)
    .route("/", deleteUser)
    .route("/", userLogin)
    .route("/", refresh)
    .route("/", verify)
    .route("/", userLogout);

export { user };
