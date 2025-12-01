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
    genres: z.array(genreSchema),
});

// TypeScript 타입 추출
export type Genre = z.infer<typeof genreSchema>;
export type BookDetailResponse = z.infer<typeof bookDetailResponseSchema>;

// DB 조회 결과 Row 타입
export interface BookRow {
    book_id: number;
    aladin_item_id: string;
    title: string;
    author: string | null;
    publisher: string | null;
    published_date: Date | null;
    description: string | null;
    thumbnail_url: string | null;
}

export interface GenreRow {
    genre_id: number;
    genre_name: string;
}
