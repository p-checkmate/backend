import { z } from "zod";
import HttpError from "http-errors";
import { Middleware } from "express-zod-api";
import { verifyToken } from "../utils/jwt.js";

export const authMiddleware = new Middleware({
    security: {
        and: [
            {
                type: "header",
                name: "Authorization",
            },
        ],
    },
    input: z.object({}),
    handler: async ({ request, logger }) => {
        logger.debug("Checking authorization token");

        // Authorization 헤더에서 토큰 추출
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw HttpError(401, "인증 토큰이 없습니다.");
        }

        const token = authHeader.substring(7); // 'Bearer ' 제거

        try {
            // 토큰 검증
            const decoded = verifyToken(token) as {
                user_id: number;
            };

            // decoded 정보를 반환 (options.user로 전달됨)
            return { user: decoded };
        } catch (error: any) {
            if (error.name === "TokenExpiredError") {
                throw HttpError(401, "토큰이 만료되었습니다.");
            }
            throw HttpError(401, "유효하지 않은 토큰입니다.");
        }
    },
});
