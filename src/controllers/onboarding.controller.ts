import { z } from "zod";
import { defaultEndpointsFactory } from "express-zod-api";
import { selectFavoriteBooks } from "../services/bookmarks.service.js";
import { selectFavoriteGenres } from "../services/users.service.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { onboardingGenreOutputSchema } from "../schemas/users.schema.js";
import { viewGenres } from "../services/users.service.js";

// 인증이 필요한 엔드포인트용 팩토리
const authEndpointsFactory = defaultEndpointsFactory.addMiddleware(authMiddleware);

// 좋아하는 책 선택
export const handleSelectFavoriteBooks = authEndpointsFactory.build({
    method: "post",
    input: z.object({
        itemIds: z.array(z.number()),
    }),
    output: z.object({
        bookmarkIds: z.array(z.number()),
    }),
    handler: async ({ input, options }) => {
        const bookmarkIds = await selectFavoriteBooks(input.itemIds, options.user.user_id);
        return { bookmarkIds };
    },
});

// 좋아하는 장르 선택
export const handleSelectFavoriteGenres = authEndpointsFactory.build({
    method: "post",
    input: z.object({
        genreIds: z.array(z.number()),
    }),
    output: z.object({
        genreIds: z.array(z.number()),
    }),
    handler: async ({ input, options }) => {
        const genreIds = await selectFavoriteGenres(input.genreIds, options.user.user_id);
        return { genreIds };
    },
});

// 온보딩 장르 조회
export const handleGetGenres = authEndpointsFactory.build({
    method: "get",
    input: z.object({
        parentId: z
            .string()
            .optional()
            .refine(
                (val) => {
                    if (val === undefined) return true;
                    const num = parseInt(val, 10);
                    return num >= 1 && num <= 12;
                },
                {
                    message: "Parent ID must be between 1 and 12.",
                }
            ),
    }),
    output: onboardingGenreOutputSchema,
    handler: async ({ input }) => {
        let parentIdForDB: number | null;

        // 쿼리 파라미터가 없으면 null을 전달
        if (input.parentId === undefined) {
            parentIdForDB = null;
        } else {
            parentIdForDB = parseInt(input.parentId, 10);
        }

        const genres = await viewGenres(parentIdForDB);
        return genres;
    },
});
