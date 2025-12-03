import { z } from "zod";
import { defaultEndpointsFactory } from "express-zod-api";
import { modifyUser } from "../services/users.service.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { modifyUserInputSchema } from "../schemas/users.schema.js";

// 인증이 필요한 엔드포인트용 팩토리
const authEndpointsFactory = defaultEndpointsFactory.addMiddleware(authMiddleware);

// 사용자 정보 수정
export const handleModifyUser = authEndpointsFactory.build({
    method: "patch",
    input: modifyUserInputSchema,
    output: z.object({
        message: z.string(),
    }),
    handler: async ({ input, options }) => {
        const message = await modifyUser(input, options.user.user_id);
        return { message };
    },
});
