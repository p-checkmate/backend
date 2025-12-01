import { Routing } from "express-zod-api";
import { handleLogin, handleRefreshToken, handleSignup } from "../controllers/auth.controller.js";

export const routing: Routing = {
    api: {
        v1: {
            auth: {
                login: handleLogin,
                refresh: handleRefreshToken,
                signup: handleSignup,
            },
        },
    },
};
