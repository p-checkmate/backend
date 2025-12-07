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
