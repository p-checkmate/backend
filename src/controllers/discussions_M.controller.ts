import { defaultEndpointsFactory } from "express-zod-api";
import { authMiddleware } from "../middlewares/auth.middleware.js";

import {
    createDiscussionInputSchema,
    createDiscussionResponseSchema,
} from "../schemas/discussions_M.schema.js";

import { createDiscussionService } from "../services/discussions_M.service.js";

// 인증된 API용 팩토리
const authEndpointsFactory = defaultEndpointsFactory.addMiddleware(authMiddleware);

export const handleCreateDiscussion = authEndpointsFactory.build({
    method: "post",
    input: createDiscussionInputSchema,
    output: createDiscussionResponseSchema,

    handler: async ({ input, options }) => {
        const userId = options.user.user_id;
        const bookId = input.bookId;

        const discussionId = await createDiscussionService({
            user_id: userId,
            book_id: bookId,
            title: input.body.title,
            content: input.body.content,
            discussion_type: input.body.discussion_type,
            option1: input.body.option1 ?? null,
            option2: input.body.option2 ?? null,
        });

        return { discussion_id: discussionId };
    },
});