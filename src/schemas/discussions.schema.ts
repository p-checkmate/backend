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

// 투표 Input 스키마
export const voteInputSchema = z.object({
    discussionId: z.coerce.number().int().positive(),
    choice: z.coerce.number().int().min(1).max(2),
});

// 투표 Response 스키마
export const voteResponseSchema = z.object({
    message: z.string(),
});

// VS 토론 종료 상세 조회 Input 스키마
export const getVsDiscussionSummaryInputSchema = z.object({
    discussionId: z.coerce.number().int().positive(),
});

// 의견 비율 스키마
export const opinionRatioSchema = z.object({
    option1_count: z.number().int(),
    option2_count: z.number().int(),
    option1_percentage: z.number(),
    option2_percentage: z.number(),
});

// VS 토론 요약 응답 스키마
export const vsDiscussionSummaryResponseSchema = z.object({
    discussion_id: z.number().int(),
    title: z.string(),
    discussion_type: z.literal("VS"),
    option1: z.string(),
    option2: z.string(),
    ended_at: z.string().nullable(),
    total_comments: z.number().int(),
    summary: z.string(),
    opinion_ratio: opinionRatioSchema,
});
// 인기 토론 Response 스키마
export const popularDiscussionResponseSchema = z.object({
    discussions: z.array(myDiscussionSchema),
});

// VS 토론 투표 여부 조회 Input 스키마
export const getVoteStatusInputSchema = z.object({
    discussionId: z.coerce.number().int().positive(),
});

// VS 토론 투표 여부 조회 Response 스키마
export const voteStatusResponseSchema = z.object({
    is_voted: z.boolean(),
    choice: z.number().int().min(1).max(2).nullable(),
});

// TypeScript 타입 추출
export type MyDiscussion = z.infer<typeof myDiscussionSchema>;
export type MyDiscussionsResponse = z.infer<typeof myDiscussionsResponseSchema>;
export type CreateDiscussionMessageInput = z.infer<typeof createDiscussionMessageInputSchema>;
export type CreateDiscussionMessageResponse = z.infer<typeof createDiscussionMessageResponseSchema>;
export type VoteInput = z.infer<typeof voteInputSchema>;
export type VoteResponse = z.infer<typeof voteResponseSchema>;
export type GetVsDiscussionSummaryInput = z.infer<typeof getVsDiscussionSummaryInputSchema>;
export type OpinionRatio = z.infer<typeof opinionRatioSchema>;
export type VsDiscussionSummaryResponse = z.infer<typeof vsDiscussionSummaryResponseSchema>;
export type PopularDiscussionResponse = z.infer<typeof popularDiscussionResponseSchema>;
export type GetVoteStatusInput = z.infer<typeof getVoteStatusInputSchema>;
export type VoteStatusResponse = z.infer<typeof voteStatusResponseSchema>;

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

export interface VsDiscussionDetailRow extends RowDataPacket {
    discussion_id: number;
    title: string;
    content: string;
    discussion_type: "VS";
    option1: string;
    option2: string;
    created_at: Date;
    end_date: Date | null;
    total_comments: number;
    option1_count: number;
    option2_count: number;
}
export interface PopularDiscussionRow extends RowDataPacket {
    discussion_id: number;
    title: string;
    content: string | null;
    like_count: number;
    comment_count: number;
    created_at: Date;
    book_id: number;
    book_title: string;
    nickname: string | null;
}
