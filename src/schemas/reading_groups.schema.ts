import { z } from "zod";
import type { RowDataPacket } from "mysql2/promise";


//함꼐 읽기 생성 요청 바디 스키마
export const createReadingGroupInputSchema = z.object({
    book_id: z.number().int().positive(),
    start_date: z.string(), 
    end_date: z.string(),
});

//함꼐 읽기 생성 응답 스키마
export const createReadingGroupResponseSchema = z.object({
    reading_group_id: z.number().int(),
    book_id: z.number().int(),
    start_date: z.string(),
    end_date: z.string(),
});

// TypeScript 타입 추출
export type CreateReadingGroupInput = z.infer<typeof createReadingGroupInputSchema>;
export type CreateReadingGroupResponse = z.infer<typeof createReadingGroupResponseSchema>;

//reading_group 테이블 Row 타입
export interface ReadingGroupRow extends RowDataPacket {
    reading_group_id: number;
    book_id: number;
    start_date: string; 
    end_date: string;  
    created_at: string;  
}

// 책 기본 정보 스키마
export const bookInfoSchema = z.object({
    book_id: z.number().int(),
    title: z.string(),
    thumbnail_url: z.string().nullable(),
    page_count: z.number().int().nullable(),
});


// GET /api/reading-groups/list - 함께 읽기 목록 조회
export const readingGroupListItemSchema = z.object({
    reading_group_id: z.number().int(),
    book: z.object({
        book_id: z.number().int(),
        title: z.string(),
        thumbnail_url: z.string().nullable(),
        page_count: z.number().int().nullable(),
    }),
    member_count: z.number().int(),
    days_left: z.number().int(),
    start_date: z.string(),
    end_date: z.string(),
    is_participating: z.boolean(),
    my_progress: z.object({
        current_page: z.number().int(),
    }).nullable(),
    member_reading_info: z.string().nullable(),
});

export const readingGroupListResponseSchema = z.object({
    reading_groups: z.array(readingGroupListItemSchema),
});

// 함께 읽기 상세(overview) 응답 스키마
export const readingGroupOverviewResponseSchema = z.object({
    reading_group_id: z.number().int(),
    title: z.string(),

    participant_count: z.number().int(),
    days_left: z.number().int(),
    total_pages: z.number().int().nullable(),

    my_progress: z
        .object({
            current_page: z.number().int(),
            memo: z.string().nullable(),
        })
        .nullable(),
});

// TypeScript 타입 추출
export type BookInfo = z.infer<typeof bookInfoSchema>;
export type ReadingGroupListItem = z.infer<typeof readingGroupListItemSchema>;
export type ReadingGroupListResponse = z.infer<typeof readingGroupListResponseSchema>;
export type ReadingGroupOverviewResponse = z.infer<typeof readingGroupOverviewResponseSchema>;

// MySQL Row 타입 (Repository용)
export interface ReadingGroupRow extends RowDataPacket {
    reading_group_id: number;
    book_id: number;
    start_date: string;
    end_date: string;
    created_at: string;
}

export interface ReadingGroupWithBookRow extends RowDataPacket {
    reading_group_id: number;
    book_id: number;
    book_title: string;
    thumbnail_url: string | null;
    page_count: number | null;
    member_count: number;
    start_date: string;
    end_date: string;
}

export interface memberRow extends RowDataPacket {
    member_id: number;
    reading_group_id: number;
    user_id: number;
    current_page: number;
    memo: string | null;
    joined_at: string;
}

export interface memberWithUserRow extends RowDataPacket {
    member_id: number;
    reading_group_id: number;
    user_id: number;
    nickname: string | null;
    current_page: number;
    memo: string | null;
}
export interface RankRow extends RowDataPacket {
    user_id: number;
    rank_num: number;
}
