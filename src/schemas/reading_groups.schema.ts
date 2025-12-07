import { z } from "zod";
import { RowDataPacket } from "mysql2/promise";

// ============================================
// 공통 스키마
// ============================================

// 책 기본 정보 스키마
export const bookInfoSchema = z.object({
    book_id: z.number().int(),
    title: z.string(),
    thumbnail_url: z.string().nullable(),
    page_count: z.number().int().nullable(),
});

// ============================================
// GET /api/reading-groups/list - 함께 읽기 목록 조회
// ============================================

export const readingGroupListItemSchema = z.object({
    reading_group_id: z.number().int(),
    book: z.object({
        book_id: z.number().int(),
        title: z.string(),
        thumbnail_url: z.string().nullable(),
        page_count: z.number().int().nullable(),
    }),
    participant_count: z.number().int(),
    days_left: z.number().int(),
    start_date: z.string(),
    end_date: z.string(),
    is_participating: z.boolean(),
    my_progress: z.object({
        current_page: z.number().int(),
    }).nullable(),
    participant_reading_info: z.string().nullable(),
});

export const readingGroupListResponseSchema = z.object({
    reading_groups: z.array(readingGroupListItemSchema),
});

// ============================================
// GET /api/reading-groups/{groupId} - 함께 읽기 기본 정보
// ============================================

export const readingGroupDetailResponseSchema = z.object({
    reading_group_id: z.number().int(),
    book: bookInfoSchema,
    participant_count: z.number().int(),
    days_left: z.number().int(),
    start_date: z.string(),
    end_date: z.string(),
    is_participating: z.boolean(),
    my_progress: z.object({
        current_page: z.number().int(),
        memo: z.string().nullable(),
    }).nullable(),
});

// ============================================
// GET /api/reading-groups/{groupId}/members - 참여자 진행 현황 목록
// ============================================

export const memberProgressSchema = z.object({
    user_id: z.number().int(),
    nickname: z.string().nullable(),
    current_page: z.number().int(),
    memo: z.string().nullable(),
});

export const membersProgressResponseSchema = z.object({
    total_pages: z.number().int().nullable(),
    members: z.array(memberProgressSchema),
});

// ============================================
// POST /api/reading-groups/{groupId}/join - 함께 읽기 참여
// ============================================

export const joinReadingGroupResponseSchema = z.object({
    participant_id: z.number().int(),
    reading_group_id: z.number().int(),
    user_id: z.number().int(),
});

// ============================================
// PATCH /api/reading-groups/{groupId}/progress - 독서 진행 업데이트
// ============================================

export const updateProgressInputSchema = z.object({
    groupId: z.coerce.number().int().positive(),
    current_page: z.number().int().min(0),
    memo: z.string().max(200).optional(),
});

export const updateProgressResponseSchema = z.object({
    success: z.boolean(),
    current_page: z.number().int(),
});

// ============================================
// POST /api/reading-groups/create - 관리자용 함께 읽기 생성
// ============================================

export const createReadingGroupInputSchema = z.object({
    book_id: z.number().int().positive(),
    start_date: z.string(),
    end_date: z.string(),
});

export const createReadingGroupResponseSchema = z.object({
    reading_group_id: z.number().int(),
    book_id: z.number().int(),
    start_date: z.string(),
    end_date: z.string(),
});

// ============================================
// TypeScript 타입 추출
// ============================================

export type BookInfo = z.infer<typeof bookInfoSchema>;
export type ReadingGroupListItem = z.infer<typeof readingGroupListItemSchema>;
export type ReadingGroupListResponse = z.infer<typeof readingGroupListResponseSchema>;
export type ReadingGroupDetailResponse = z.infer<typeof readingGroupDetailResponseSchema>;
export type MemberProgress = z.infer<typeof memberProgressSchema>;
export type MembersProgressResponse = z.infer<typeof membersProgressResponseSchema>;
export type JoinReadingGroupResponse = z.infer<typeof joinReadingGroupResponseSchema>;
export type UpdateProgressInput = z.infer<typeof updateProgressInputSchema>;
export type UpdateProgressResponse = z.infer<typeof updateProgressResponseSchema>;
export type CreateReadingGroupInput = z.infer<typeof createReadingGroupInputSchema>;
export type CreateReadingGroupResponse = z.infer<typeof createReadingGroupResponseSchema>;

// ============================================
// MySQL Row 타입 (Repository용)
// ============================================

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
    participant_count: number;
    start_date: string;
    end_date: string;
}

export interface ParticipantRow extends RowDataPacket {
    participant_id: number;
    reading_group_id: number;
    user_id: number;
    current_page: number;
    memo: string | null;
    joined_at: string;
}

export interface ParticipantWithUserRow extends RowDataPacket {
    participant_id: number;
    reading_group_id: number;
    user_id: number;
    nickname: string | null;
    current_page: number;
    memo: string | null;
}
