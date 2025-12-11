// schemas/discussions_summary.schema.ts

import { z } from "zod";
import { RowDataPacket } from "mysql2/promise";

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
    is_ended: z.boolean(),
    ended_at: z.string().nullable(),
    total_comments: z.number().int(),
    summary: z.string(),
    opinion_ratio: opinionRatioSchema,
});

// TypeScript 타입 추출
export type GetVsDiscussionSummaryInput = z.infer<typeof getVsDiscussionSummaryInputSchema>;
export type OpinionRatio = z.infer<typeof opinionRatioSchema>;
export type VsDiscussionSummaryResponse = z.infer<typeof vsDiscussionSummaryResponseSchema>;

// MySQL Row 타입 (Repository용)
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
