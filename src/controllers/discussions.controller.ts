import { defaultEndpointsFactory } from "express-zod-api";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
    createDiscussionMessageInputSchema,
    createDiscussionMessageResponseSchema,
    voteInputSchema,
    voteResponseSchema,
} from "../schemas/discussions.schema.js";
import {
    createDiscussionMessageService,
    voteDiscussionService,
} from "../services/discussions.service.js";

// 인증된 API 팩토리
const authEndpointsFactory = defaultEndpointsFactory.addMiddleware(authMiddleware);

// POST /api/v1/discussions/:discussionId/messages - 토론 메시지 작성
export const handleCreateDiscussionMessage = authEndpointsFactory.build({
    method: "post",
    input: createDiscussionMessageInputSchema,
    output: createDiscussionMessageResponseSchema,

    handler: async ({ input, options }) => {
        const userId = options.user.user_id;

        return await createDiscussionMessageService(
            input.discussionId,
            userId,
            input.content,
            input.choice
        );
    },
});

// POST /api/v1/discussions/:discussionId/vote - VS 토론 투표
export const handleVoteDiscussion = authEndpointsFactory.build({
    method: "post",
    input: voteInputSchema,
    output: voteResponseSchema,

    handler: async ({ input, options }) => {
        const userId = options.user.user_id;

        return await voteDiscussionService(
            userId,
            input.discussionId,
            input.choice
        );
    },
});