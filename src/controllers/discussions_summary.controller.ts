// controllers/discussions_summary.controller.ts

import { defaultEndpointsFactory } from "express-zod-api";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
    getVsDiscussionSummaryInputSchema,
    vsDiscussionSummaryResponseSchema,
} from "../schemas/discussions_summary.schema.js";
import { getVsDiscussionSummaryService } from "../services/discussions_summary.service.js";

// 인증된 API 팩토리
const authEndpointsFactory = defaultEndpointsFactory.addMiddleware(authMiddleware);

// GET /api/v1/discussions/:discussionId/summary - VS 토론 종료 상세 조회 (요약 포함)
export const handleGetVsDiscussionSummary = authEndpointsFactory.build({
    method: "get",
    input: getVsDiscussionSummaryInputSchema,
    output: vsDiscussionSummaryResponseSchema,

    handler: async ({ input, options }) => {
        const userId = options.user.user_id;
        return await getVsDiscussionSummaryService(input.discussionId, userId);
    },
});
