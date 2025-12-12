import { z } from "zod";
import { defaultEndpointsFactory } from "express-zod-api";
import { aiChatResponseSchema } from "../schemas/ai.schema.js";
import { initAiChatService } from "../services/ai.service.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

// 인증이 필요한 엔드포인트용 팩토리
const authEndpointsFactory = defaultEndpointsFactory.addMiddleware(authMiddleware);

// AI 채팅 초기 세팅
export const handleInitAiChats = authEndpointsFactory.build({
    method: "post",
    input: z.object({}),
    output: aiChatResponseSchema,
    handler: async () => {
        return await initAiChatService();
    },
});
