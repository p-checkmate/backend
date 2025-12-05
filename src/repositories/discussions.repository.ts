import { pool } from "../config/db.config.js";
import { MyDiscussionRow } from "../schemas/discussions.schema.js";

// 사용자별 토론 리스트 조회 (책 정보, 댓글 수 포함)
export const getDiscussionsByUserId = async (
    userId: number,
    limit: number,
    offset: number
): Promise<MyDiscussionRow[]> => {
    const [rows] = await pool.query<MyDiscussionRow[]>(
        `
        SELECT 
            d.discussion_id,
            d.title,
            d.content,
            d.like_count,
            d.created_at,
            b.book_id,
            b.title AS book_title,
            u.nickname,
            (SELECT COUNT(*) FROM discussion_comment dc WHERE dc.discussion_id = d.discussion_id) AS comment_count
        FROM discussion d
        INNER JOIN book b ON d.book_id = b.book_id
        INNER JOIN user u ON d.user_id = u.user_id
        WHERE d.user_id = ?
        ORDER BY d.created_at DESC
        LIMIT ? OFFSET ?
        `,
        [userId, limit, offset]
    );

    return rows;
};

// 사용자 토론 총 개수 조회
export const countDiscussionsByUserId = async (userId: number): Promise<number> => {
    const [rows] = await pool.query<any[]>(
        `SELECT COUNT(*) AS total FROM discussion WHERE user_id = ?`,
        [userId]
    );

    return rows[0].total;
};