import { z } from "zod";
import { defaultEndpointsFactory } from "express-zod-api";
import { bookSearchResponseSchema } from "../schemas/aladin.schema.js";
import { bookDetailResponseSchema, bookmarkResponseSchema } from "../schemas/books.schema.js";
import { searchBooks, getBookDetail, viewBestsellers } from "../services/books.service.js";
import { authMiddleware } from "../middlewares/auth.middleware.js"; 
import { addBookmark } from "../services/books.service.js";

const authEndpointsFactory = defaultEndpointsFactory.addMiddleware(authMiddleware);

// GET /api/v1/books/search?q=
// 알라딘 API 기반 도서 검색
export const handleSearchBooks = authEndpointsFactory.build({
    method: "get",
    input: z.object({
        q: z.string().min(1),
        start: z.string().optional().default("1").transform((val) => parseInt(val, 10)),
        maxResults: z.string().optional().default("30").transform((val) => parseInt(val, 10)),
    }),
    output: bookSearchResponseSchema,
    handler: async ({ input }) => {
        return await searchBooks(input.q, input.start, input.maxResults);
    },
});

// GET /api/v1/books/:bookId
// 책 상세 정보 조회
export const handleGetBookDetail = authEndpointsFactory.build({
    method: "get",
    input: z.object({
        bookId: z.string().transform((val) => parseInt(val, 10)),
    }),
    output: bookDetailResponseSchema,
    handler: async ({ input }) => {
        return await getBookDetail(input.bookId);
    },
});

// GET /api/v1/books/bestsellers
// 베스트셀러 조회
export const handleViewBestsellers = authEndpointsFactory.build({
    method: "get",
    input: z.object({
        start: z
            .string()
            .optional()
            .default("1")
            .transform((val) => parseInt(val, 10)),
        maxResults: z
            .string()
            .optional()
            .default("30")
            .transform((val) => parseInt(val, 10)),
    }),
    output: bookSearchResponseSchema,
    handler: async ({ input }) => {
        return await viewBestsellers(input.start, input.maxResults);
    },
});

// POST /api/v1/books/:bookId/bookmark
// 북마크 추가
export const handleAddBookmark = authEndpointsFactory.build({
    method: "post",
    input: z.object({
        bookId: z.string().transform((val) => parseInt(val, 10)), 
    }),
    output: bookmarkResponseSchema,
    handler: async ({ input, options }) => {
        const userId = options.user.user_id;
        return await addBookmark(userId, input.bookId);
    },
}); 