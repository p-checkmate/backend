import { z } from "zod";
import { defaultEndpointsFactory } from "express-zod-api";
import { getMyPageInfo, getUserBookmarks } from "../services/mypage.service.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { mypageOutputSchema } from "../schemas/mypage.schema.js";
import { userBookmarksResponseSchema } from "../schemas/books.schema.js";

// 인증이 필요한 엔드포인트용 팩토리
const authEndpointsFactory = defaultEndpointsFactory.addMiddleware(authMiddleware);

// 마이페이지 전체 정보 조회
export const handleGetMyPage = authEndpointsFactory.build({
    method: "get",
    input: z.object({}),
    output: mypageOutputSchema,
    handler: async ({ options }) => {
        const mypageInfo = await getMyPageInfo(options.user.user_id);
        return mypageInfo;
    },
});

// 나의 책장 전체 목록 조회 (무한 스크롤)
export const handleGetMyBookshelf = authEndpointsFactory.build({
    method: "get",
    input: z.object({
        page: z
            .string()
            .optional()
            .default("1")
            .transform((val) => parseInt(val, 10)),
        limit: z
            .string()
            .optional()
            .default("10")
            .transform((val) => parseInt(val, 10)),
    }),
    output: userBookmarksResponseSchema,
    handler: async ({ input, options }) => {
        const userId = options.user.user_id;
        return await getUserBookmarks(userId, input.page, input.limit);
    },
});