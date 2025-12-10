import { z } from "zod";
import { defaultEndpointsFactory } from "express-zod-api";
import { authMiddleware } from "../middlewares/auth.middleware.js";

import {
    createDiscussionInputSchema,
    createDiscussionResponseSchema,
    getDiscussionsByBookInputSchema,
    getDiscussionsByBookResponseSchema,
    getDiscussionDetailInputSchema,
    getDiscussionDetailResponseSchema,
    getDiscussionMessagesInputSchema,
    getDiscussionMessagesResponseSchema,
} from "../schemas/discussions_M.schema.js";

import {
    createDiscussionService,
    getDiscussionsByBookService,
    getDiscussionDetailService,
    getDiscussionMessagesService,
} from "../services/discussions_M.service.js";

import {
    discussionLikeInputSchema,
    discussionLikeResponseSchema,
} from "../schemas/discussions_M.schema.js";

import { likeDiscussionService } from "../services/discussions_M.service.js";


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

export const handleGetDiscussionsByBook = authEndpointsFactory.build({
    method: "get",
    input: getDiscussionsByBookInputSchema,
    output: getDiscussionsByBookResponseSchema,

    handler: async ({ input }) => {
    const discussions = await getDiscussionsByBookService(input.bookId);
    return { discussions };
    },
});

// 토론 상세조회 
export const handleGetDiscussionDetail = authEndpointsFactory.build({
    method: "get",
    input: getDiscussionDetailInputSchema,
    output: getDiscussionDetailResponseSchema,

    handler: async ({ input }) => {
    const discussion = await getDiscussionDetailService(input.discussionId);
    return { discussion };
},
});

//토론내용 조회
export const handleGetDiscussionMessages = authEndpointsFactory.build({
    method: "get",
    input: getDiscussionMessagesInputSchema,
    output: getDiscussionMessagesResponseSchema,

    handler: async ({ input }) => {
    const messages = await getDiscussionMessagesService(input.discussionId);
    return { messages };
    },
});

// 토론 좋아요 등록
export const handleLikeDiscussion = authEndpointsFactory.build({
    method: "post",
    input: discussionLikeInputSchema,
    output: discussionLikeResponseSchema,

    handler: async ({ input, options }) => {
    const userId = options.user.user_id;
    const discussionId = input.discussionId;

    const result = await likeDiscussionService(userId, discussionId);
    return result;
    },
});
