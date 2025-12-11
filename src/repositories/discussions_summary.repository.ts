// repositories/discussions_summary.repository.ts

import { pool } from "../config/db.config.js";
import { RowDataPacket } from "mysql2/promise";
import { VsDiscussionDetailRow } from "../schemas/discussions_summary.schema.js";

// VS 토론 상세 정보 조회 (종료 여부, 의견 비율 포함)
export const getVsDiscussionWithStats = async (
    discussionId: number
): Promise<VsDiscussionDetailRow | null> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `
        SELECT 
            d.discussion_id,
            d.title,
            d.content,
            d.discussion_type,
            d.option1,
            d.option2,
            d.created_at,
            d.end_date,
            (SELECT COUNT(*) FROM discussion_comment dc WHERE dc.discussion_id = d.discussion_id) AS total_comments,
            (SELECT COUNT(*) FROM discussion_comment dc WHERE dc.discussion_id = d.discussion_id AND dc.choice = 1) AS option1_count,
            (SELECT COUNT(*) FROM discussion_comment dc WHERE dc.discussion_id = d.discussion_id AND dc.choice = 2) AS option2_count
        FROM discussion d
        WHERE d.discussion_id = ? AND d.discussion_type = 'VS'
        `,
        [discussionId]
    );

    return rows.length ? (rows[0] as VsDiscussionDetailRow) : null;
};

// VS 토론의 모든 메시지 조회 (요약용)
export interface DiscussionMessageForSummary extends RowDataPacket {
    comment_id: number;
    nickname: string;
    content: string;
    choice: number | null;
    created_at: Date;
}

export const getDiscussionMessagesForSummary = async (
    discussionId: number
): Promise<DiscussionMessageForSummary[]> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `
        SELECT 
            dc.comment_id,
            u.nickname,
            dc.content,
            dc.choice,
            dc.created_at
        FROM discussion_comment dc
        INNER JOIN user u ON dc.user_id = u.user_id
        WHERE dc.discussion_id = ?
        ORDER BY dc.choice ASC, dc.created_at ASC
        `,
        [discussionId]
    );

    return rows as DiscussionMessageForSummary[];
};

// 토론 종료 여부 확인 (end_date가 현재 시간보다 이전인지)
export const isDiscussionEnded = async (
    discussionId: number
): Promise<boolean> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `
        SELECT 
            CASE 
                WHEN end_date IS NOT NULL AND end_date <= NOW() THEN 1
                ELSE 0
            END AS is_ended
        FROM discussion
        WHERE discussion_id = ?
        `,
        [discussionId]
    );

    return rows.length ? (rows[0] as { is_ended: number }).is_ended === 1 : false;
};
