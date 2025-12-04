import { z } from "zod";
import { defaultEndpointsFactory } from "express-zod-api";
import { selectFavoriteBooks } from "../services/bookmarks.service.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

// 인증이 필요한 엔드포인트용 팩토리
const authEndpointsFactory = defaultEndpointsFactory.addMiddleware(authMiddleware);

// 좋아하는 책 선택
export const handleSelectFavoriteBooks = authEndpointsFactory.build({
    method: "post",
    input: z.object({
        itemIds: z.array(z.number()),
    }),
    output: z.object({
        bookIds: z.array(z.number()),
    }),
    handler: async ({ input, options }) => {
        const bookIds = await selectFavoriteBooks(input.itemIds, options.user.user_id);
        return { bookIds };
    },
});
