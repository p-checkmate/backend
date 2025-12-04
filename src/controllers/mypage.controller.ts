import { z } from "zod";
import { defaultEndpointsFactory } from "express-zod-api";
import { getMyPageInfo } from "../services/mypage.service.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { mypageOutputSchema } from "../schemas/mypage.schema.js";

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
