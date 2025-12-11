import { z } from "zod";
import { RowDataPacket } from "mysql2/promise";

//quote 수정 input (PATCH /quotes/:id)
export const updateQuoteSchema = z.object({
    content: z.string().min(1).max(500),
});

//output schema (DB → API 응답)
export const quoteSchema = z.object({
    quote_id: z.number().int(),
    user_id: z.number().int(),
    nickname: z.string().nullable(),
    book_id: z.number().int(),
    content: z.string(),
    like_count: z.number().int(),
    created_at: z.iso.datetime(),
    updated_at: z.iso.datetime().nullable(),
});

export const bookSchema = z.object({
    title: z.string(),
    author: z.string(),
    publisher: z.string().nullable(),
    published_date: z.string().nullable(),
    description: z.string().nullable(),
    thumbnail_url: z.string().nullable(),
    page_count: z.number().nullable(),
    genres: z.array(z.string()),
});

export const quoteWithBookSchema = quoteSchema.extend({
    book: bookSchema,
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

// TypeScript 타입 추출
export type QuoteData = z.infer<typeof quoteSchema>;
export type MyQuote = z.infer<typeof myQuoteSchema>;
export type MyQuotesResponse = z.infer<typeof myQuotesResponseSchema>;

// MySQL Row 타입
export interface QuoteRow extends RowDataPacket {
    quote_id: number;
    user_id: number;
    nickname: string | null;
    book_id: number;
    content: string;
    like_count: number;
    created_at: Date;
    updated_at: Date | null;
}

// 내 인용구 조회용 Row 타입
export interface MyQuoteRow extends RowDataPacket {
    quote_id: number;
    content: string;
    like_count: number;
    created_at: string;
    book_id: number;
    item_id: number;
    book_title: string;
    genre_names: string | null;
    nickname: string | null;
}
