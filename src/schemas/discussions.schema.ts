import { z } from "zod";
import { RowDataPacket } from "mysql2/promise";

// 내 토론 목록용 스키마
export const myDiscussionSchema = z.object({
    discussion_id: z.number().int(),
    title: z.string(),
    content: z.string().nullable(),
    like_count: z.number().int(),
    comment_count: z.number().int(),
    created_at: z.string(),
    book: z.object({
        book_id: z.number().int(),
        title: z.string(),
    }),
    user: z.object({
        nickname: z.string().nullable(),
    }),
});

// 페이지네이션 포함 응답 스키마
export const myDiscussionsResponseSchema = z.object({
    page: z.number().int(),
    limit: z.number().int(),
    total_count: z.number().int(),
    total_pages: z.number().int(),
    has_next: z.boolean(),
    discussions: z.array(myDiscussionSchema),
});

// 토론 메시지 생성 입력 스키마
export const createDiscussionMessageInputSchema = z.object({
    discussionId: z.coerce.number().int().positive(),
    content: z.string().min(1).max(1000),
    choice: z.coerce.number().int().min(1).max(2).optional(),
});

// 토론 메시지 생성 응답 스키마
export const createDiscussionMessageResponseSchema = z.object({
    comment_id: z.number(),
    exp_earned: z.number(),
});

// TypeScript 타입 추출
export type MyDiscussion = z.infer<typeof myDiscussionSchema>;
export type MyDiscussionsResponse = z.infer<typeof myDiscussionsResponseSchema>;
export type CreateDiscussionMessageInput = z.infer<typeof createDiscussionMessageInputSchema>;
export type CreateDiscussionMessageResponse = z.infer<typeof createDiscussionMessageResponseSchema>;

// MySQL Row 타입
export interface MyDiscussionRow extends RowDataPacket {
    discussion_id: number;
    title: string;
    content: string | null;
    view_count: number;
    like_count: number;
    comment_count: number;
    created_at: string;
    book_id: number;
    item_id: number;
    book_title: string;
    nickname: string | null;
}

export interface DiscussionCommentRow extends RowDataPacket {
    comment_id: number;
    discussion_id: number;
    user_id: number;
    content: string;
    choice: number | null;
    created_at: Date;
    updated_at: Date | null;
}
