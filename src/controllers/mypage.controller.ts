import { z } from "zod";
import { defaultEndpointsFactory } from "express-zod-api";
import { getMyPageInfo, getUserBookmarks } from "../services/mypage.service.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { mypageOutputSchema } from "../schemas/mypage.schema.js";
import { userBookmarksResponseSchema } from "../schemas/books.schema.js";
import { myQuotesResponseSchema } from "../schemas/quotes.schema.js";
import { getMyQuotesService } from "../services/mypage.service.js";
import { myDiscussionsResponseSchema } from "../schemas/discussions.schema.js";
import { getMyDiscussionsService } from "../services/mypage.service.js";

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

// 나의 책장 전체 목록 조회 
export const handleGetMyBookshelf = authEndpointsFactory.build({
    method: "get",
    input: z.object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(50).default(10),
    }),
    output: userBookmarksResponseSchema,
    handler: async ({ input, options }) => {
        const userId = options.user.user_id;
        return await getUserBookmarks(userId, input.page, input.limit);
    },
});

// 내가 작성한 인용구 조회
export const handleGetMyQuotes = authEndpointsFactory.build({
    method: "get",
    input: z.object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(50).default(10),
    }),
    output: myQuotesResponseSchema,
    handler: async ({ input, options }) => {
        const userId = options.user.user_id;
        return await getMyQuotesService(userId, input.page, input.limit);
    },
});

// 내가 작성한 토론 조회
export const handleGetMyDiscussions = authEndpointsFactory.build({
    method: "get",
    input: z.object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(50).default(10),
    }),
    output: myDiscussionsResponseSchema,
    handler: async ({ input, options }) => {
        const userId = options.user.user_id;
        return await getMyDiscussionsService(userId, input.page, input.limit);
    },
});