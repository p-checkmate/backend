import { z } from "zod";
//quote 수정 input (PATCH /quotes/:id)
export const updateQuoteSchema = z.object({
    content: z.string().min(1).max(500),
});
//output schema (DB → API 응답)
export const quoteSchema = z.object({
    quote_id: z.number().int(),
    user_id: z.number().int(),
    book_id: z.number().int(),
    content: z.string(),
    like_count: z.number().int(),
    created_at: z.string(),
    updated_at: z.string().nullable(),
});
// 내 인용구 목록용 스키마 (책 정보 포함)
export const myQuoteSchema = z.object({
    quote_id: z.number().int(),
    content: z.string(),
    like_count: z.number().int(),
    created_at: z.string(),
    book: z.object({
        book_id: z.number().int(),
        title: z.string(),
        genres: z.array(z.string()),
    }),
    user: z.object({
        nickname: z.string().nullable(),
    }),
});
// 페이지네이션 스키마
export const paginationSchema = z.object({
    page: z.number().int(),
    limit: z.number().int(),
    total_count: z.number().int(),
    total_pages: z.number().int(),
    has_next: z.boolean(),
});
export const myQuotesResponseSchema = paginationSchema.extend({
    quotes: z.array(myQuoteSchema),
});
