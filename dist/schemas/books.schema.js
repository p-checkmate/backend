import { z } from "zod";
// 장르 스키마
export const genreSchema = z.object({
    genreId: z.number(),
    genreName: z.string(),
});
// 책 상세 조회 응답 스키마
export const bookDetailResponseSchema = z.object({
    bookId: z.number(),
    itemId: z.string(),
    title: z.string(),
    author: z.string().nullable(),
    publisher: z.string().nullable(),
    publishedDate: z.string().nullable(),
    description: z.string().nullable(),
    thumbnailUrl: z.string().nullable(),
    page: z.number().nullable(),
    genres: z.array(genreSchema),
});
// 북마크 응답 스키마
export const bookmarkResponseSchema = z.object({
    bookmarkId: z.number(),
    userId: z.number(),
    bookId: z.number(),
});
// 북마크 아이템 스키마 (나의 책장용)
export const bookmarkItemSchema = z.object({
    bookmark_id: z.number(),
    book_id: z.number(),
    title: z.string(),
    author: z.string().nullable(),
    thumbnail_url: z.string().nullable(),
    genres: z.array(z.string()),
});
// 사용자 북마크 목록 응답 스키마 (무한 스크롤용)
export const userBookmarksResponseSchema = z.object({
    page: z.number(),
    limit: z.number(),
    total_count: z.number(),
    total_pages: z.number(),
    has_next: z.boolean(),
    bookmarks: z.array(bookmarkItemSchema),
});
