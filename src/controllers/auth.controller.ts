import { z } from "zod";
import { defaultEndpointsFactory } from "express-zod-api";
import {
    loginInputSchema,
    loginOutputSchema,
    refreshInputSchema,
    refreshOutputSchema,
} from "../schemas/users.schema.js";
import { refreshAccessToken, userLogin } from "../services/users.service.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

// 인증이 필요한 엔드포인트용 팩토리
const authEndpointsFactory = defaultEndpointsFactory.addMiddleware(authMiddleware);

// 로그인
export const handleLogin = defaultEndpointsFactory.build({
    method: "post",
    input: loginInputSchema,
    output: loginOutputSchema,
    handler: async ({ input }) => {
        return await userLogin(input);
    },
});

// 리프레시 토큰으로 액세스 토큰 재발급
export const handleRefreshToken = defaultEndpointsFactory.build({
    method: "post",
    input: refreshInputSchema,
    output: refreshOutputSchema,
    handler: async ({ input }) => {
        return await refreshAccessToken(input);
    },
});
