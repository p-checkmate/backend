import { Routing } from "express-zod-api";
import { handleLogin, handleRefreshToken, handleLogout } from "../controllers/auth.controller.js";

export const routing: Routing = {
    api: {
        v1: {
            auth: {
                login: handleLogin,
                refresh: handleRefreshToken,
                logout: handleLogout,
            },
        },
    },
};
