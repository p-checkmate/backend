import { z } from "zod";

// 검색 결과의 각 아이템(책 1권) 스키마
export const aladinBookItemSchema = z.object({
    itemId: z.number(), // 알라딘 내부 도서 ID
    title: z.string(), // 제목
    author: z.string(), // 저자
    publisher: z.string(), // 출판사
    pubDate: z.string(), // 출간일
    description: z.string(), // 책 소개
    isbn13: z.string(), // ISBN13
    cover: z.string(), // 표지 이미지 URL
    categoryNames: z.array(z.string()).optional(), // 카테고리 경로
});

// 검색 API 전체 응답 스키마
export const bookSearchResponseSchema = z.object({
    totalResults: z.number(), // 전체 검색 결과 수
    startIndex: z.number(), // 현재 페이지 시작 위치
    hasMore: z.boolean(), // 다음 결과가 더 있는지 여부
    itemsPerPage: z.number(), // 한 번에 받은 아이템 수
    items: z.array(aladinBookItemSchema), // 책 리스트
});

// TypeScript 추론 타입
export type AladinBookItem = z.infer<typeof aladinBookItemSchema>;
export type BookSearchResponse = z.infer<typeof bookSearchResponseSchema>;

/* 알라딘의 ItemSearch / ItemLookUp API에서 내려오는 
"책 한 권"의 원시(JSON) 데이터 구조를 표현하는 타입. */
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
    subInfo?: {
        itemPage?: number;
    };
}

//알라딘 검색 API(ItemSearch), 베스트셀러 조회 API(ItemList) 원본 응답 타입
export interface AladinApiResponse {
    item: AladinApiItem[];
    totalResults: number;
    startIndex: number;
    itemsPerPage: number;
}

//알라딘 상세 조회 API(ItemLookUp) 원본 응답 타입
export interface AladinItemLookupResponse {
    item: AladinApiItem[];
}
