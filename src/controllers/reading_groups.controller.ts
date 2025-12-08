import { z } from "zod";
import { defaultEndpointsFactory } from "express-zod-api";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { readingGroupListResponseSchema } from "../schemas/reading_groups.schema.js";
import { getReadingGroupList } from "../services/reading_groups.service.js";

// 인증이 필요한 엔드포인트용 팩토리
const authEndpointsFactory = defaultEndpointsFactory.addMiddleware(authMiddleware);

// GET /api/reading-groups/list - 함께 읽기 목록 조회
export const handleGetReadingGroupList = authEndpointsFactory.build({
    method: "get",
    input: z.object({}),
    output: readingGroupListResponseSchema,
    handler: async ({ options }) => {
        const userId = options.user.user_id;
        return await getReadingGroupList(userId);
    },
});
