import { z } from "zod";

//알라딘 API 검색 결과 아이템 스키마 
export const aladinBookItemSchema = z.object({
    itemId: z.number(),
    title: z.string(),
    author: z.string(),
    publisher: z.string(),
    pubDate: z.string(),
    description: z.string(),
    isbn13: z.string(),
    cover: z.string(),
    categoryNames: z.array(z.string()).optional(),
});

//검색 결과 응답 스키마
export const bookSearchResponseSchema = z.object({
    totalResults: z.number(),
    startIndex: z.number(),
    itemsPerPage: z.number(),
    hasMore: z.boolean(),
    items: z.array(aladinBookItemSchema),
});

//TypeScript 타입 추출
export type AladinBookItem = z.infer<typeof aladinBookItemSchema>;
export type BookSearchResponse = z.infer<typeof bookSearchResponseSchema>;


//알라딘 API 원본 응답 타입
export interface AladinApiResponse {
    version: string;
    title: string;
    link: string;
    pubDate: string;
    totalResults: number;
    startIndex: number;
    itemsPerPage: number;
    query: string;
    searchCategoryId: number;
    searchCategoryName: string;
    item: AladinApiItem[];
}


// 알라딘 API 원본 도서 아이템 타입
export interface AladinApiItem {
    itemId: number;
    title: string;
    author: string;
    publisher: string;
    pubDate: string;
    description: string;
    isbn13: string;
    cover: string;
    categoryName?: string;
}