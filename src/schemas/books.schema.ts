import { z } from "zod";
import { RowDataPacket } from "mysql2";

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

// 책 북마크 여부 응답 스키마
export const bookmarkStatusResponseSchema = z.object({
    isBookmarked: z.boolean(),
});

// 북마크 아이템 스키마 (나의 책장용)
export const bookmarkItemSchema = z.object({
    bookmark_id: z.number(),
    book_id: z.number(),
    item_id: z.number(),
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

export const aiRecommendationData = z.object({
    itemId: z.number(),
    thumbnailUrl: z.string().nullable(),
});

// AI 추천 도서 응답 스키마
export const aiRecommendationResponseSchema = z.object({
    recommendations: z.array(aiRecommendationData),
});

export const bookThumbnail = z.object({
    itemId: z.number(),
    thumbnailUrl: z.string().nullable(),
});

// 책 썸네일 응답 스키마 (홈)
export const bookThumbnailResponseSchema = z.object({
    books: z.array(bookThumbnail),
});

// TypeScript 타입 추출
export type Genre = z.infer<typeof genreSchema>;
export type BookDetailResponse = z.infer<typeof bookDetailResponseSchema>;
export type BookmarkResponse = z.infer<typeof bookmarkResponseSchema>;
export type BookmarkItem = z.infer<typeof bookmarkItemSchema>;
export type UserBookmarksResponse = z.infer<typeof userBookmarksResponseSchema>;
export type BookmarkStatusResponse = z.infer<typeof bookmarkStatusResponseSchema>;
export type AiRecommendationData = z.infer<typeof aiRecommendationData>;
export type AiRecommendationResponse = z.infer<typeof aiRecommendationResponseSchema>;
export type BookThumbnailResponse = z.infer<typeof bookThumbnailResponseSchema>;

// DB 조회 결과 Row 타입 (Repository 전용)
export interface BookRow {
    book_id: number;
    aladin_item_id: string;
    title: string;
    author: string | null;
    publisher: string | null;
    published_date: Date | null;
    page: number | null;
    description: string | null;
    thumbnail_url: string | null;
    page_count: number | null;
}

export interface GenreRow {
    genre_id: number;
    genre_name: string;
}

// 북마크 관련 Row 타입
export interface BookmarkRow extends RowDataPacket {
    bookmark_id: number;
    book_id: number;
    item_id: number;
    title: string;
    author: string | null;
    thumbnail_url: string | null;
}

export interface BookGenreRow extends RowDataPacket {
    genre_name: string;
}

export interface PopularBookRow extends RowDataPacket {
    item_id: number;
    thumbnail_url: string | null;
}
