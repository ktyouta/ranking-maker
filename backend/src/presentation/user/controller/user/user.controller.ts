import { Hono } from "hono";
import type { AppEnv } from "../../../../types";
import { createUser } from "../create-user/create-user.controller";
import { updateUser } from "../update-user/update-user.controller";
import { updateUserTheme } from "../update-user-theme/update-user-theme.controller";
import { updatePassword } from "../update-password/update-password.controller";
import { deleteUser } from "../delete-user/delete-user.controller";

const user = new Hono<AppEnv>()
    .route("/", createUser)
    .route("/", updateUser)
    .route("/", updateUserTheme)
    .route("/", updatePassword)
    .route("/", deleteUser);

export { user };
