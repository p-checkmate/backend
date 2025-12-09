import { defaultEndpointsFactory } from "express-zod-api";
import { authMiddleware } from "../middlewares/auth.middleware.js";

import {
    createDiscussionInputSchema,
    createDiscussionResponseSchema,
} from "../schemas/discussions_M.schema.js";

import { createDiscussionService } from "../services/discussions_M.service.js";

import {
    getDiscussionsByBookInputSchema,
    getDiscussionsByBookResponseSchema,
} from "../schemas/discussions_M.schema.js";

import { getDiscussionsByBookService } from "../services/discussions_M.service.js";

// 인증된 API 팩토리
const authEndpointsFactory = defaultEndpointsFactory.addMiddleware(authMiddleware);

export const handleCreateDiscussion = authEndpointsFactory.build({
    method: "post",
    input: createDiscussionInputSchema,
    output: createDiscussionResponseSchema,

    handler: async ({ input, options }) => {
        const userId = options.user.user_id;
        const bookId = input.bookId; // URL params

        const discussionId = await createDiscussionService({
            user_id: userId,
            book_id: bookId,
            title: input.title,
            content: input.content,
            discussion_type: input.discussion_type,
            option1: input.option1 ?? null,
            option2: input.option2 ?? null,
        });

        return { discussion_id: discussionId };
    },
});

export const handleGetDiscussionsByBook = defaultEndpointsFactory.build({
    method: "get",
    input: getDiscussionsByBookInputSchema,
    output: getDiscussionsByBookResponseSchema,

    handler: async ({ input }) => {
    const discussions = await getDiscussionsByBookService(input.bookId);
    return { discussions };
    },
});

import {
    getDiscussionDetailInputSchema,
    getDiscussionDetailResponseSchema,
} from "../schemas/discussions_M.schema.js";

import { getDiscussionDetailService } from "../services/discussions_M.service.js";

// 토론 상세조회 — 인증 필요 없음 (FE 일반 사용자 접근 가능)
export const handleGetDiscussionDetail = defaultEndpointsFactory.build({
    method: "get",
    input: getDiscussionDetailInputSchema,
    output: getDiscussionDetailResponseSchema,

    handler: async ({ input }) => {
    const discussion = await getDiscussionDetailService(input.discussionId);
    return { discussion };
},
});
