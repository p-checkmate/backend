import { pool } from "../config/db.config.js";
import { MyDiscussionRow } from "../schemas/discussions.schema.js";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

// 토론 리스트 조회 헬퍼 함수 (내가 작성한 / 좋아요한 공통)
const getDiscussionsWithDetails = async (
    userId: number,
    limit: number,
    offset: number,
    type: "written" | "liked"
): Promise<MyDiscussionRow[]> => {
    const isLiked = type === "liked";

    const [rows] = await pool.query<MyDiscussionRow[]>(
        `
        SELECT 
            d.discussion_id,
            d.title,
            d.content,
            d.view_count,
            d.like_count,
            d.created_at,
            b.book_id,
            b.aladin_item_id as item_id,
            b.title AS book_title,
            u.nickname,
            (SELECT COUNT(*) FROM discussion_comment dc WHERE dc.discussion_id = d.discussion_id) AS comment_count
            ${isLiked ? ", MAX(dl.like_id) AS liked_at" : ""}
        FROM ${
            isLiked
                ? "discussion_like dl INNER JOIN discussion d ON dl.discussion_id = d.discussion_id"
                : "discussion d"
        }
        INNER JOIN book b ON d.book_id = b.book_id
        INNER JOIN user u ON d.user_id = u.user_id
        WHERE ${isLiked ? "dl" : "d"}.user_id = ?
        GROUP BY d.discussion_id
        ORDER BY ${isLiked ? "liked_at" : "d.created_at"} DESC
        LIMIT ? OFFSET ?
        `,
        [userId, limit, offset]
    );

    return rows;
};

// 사용자별 토론 리스트 조회 (책 정보, 댓글 수 포함)
export const getDiscussionsByUserId = async (
    userId: number,
    limit: number,
    offset: number
): Promise<MyDiscussionRow[]> => {
    return getDiscussionsWithDetails(userId, limit, offset, "written");
};

// 사용자가 좋아요한 토론 리스트 조회 (책 정보, 댓글 수 포함)
export const getLikedDiscussionsByUserId = async (
    userId: number,
    limit: number,
    offset: number
): Promise<MyDiscussionRow[]> => {
    return getDiscussionsWithDetails(userId, limit, offset, "liked");
};

// 사용자 토론 총 개수 조회
export const countDiscussionsByUserId = async (userId: number): Promise<number> => {
    const [rows] = await pool.query<any[]>(`SELECT COUNT(*) AS total FROM discussion WHERE user_id = ?`, [userId]);

    return rows[0].total;
};

// 사용자가 좋아요한 토론 총 개수 조회
export const countLikedDiscussionsByUserId = async (userId: number): Promise<number> => {
    const [rows] = await pool.query<any[]>(`SELECT COUNT(*) AS total FROM discussion_like WHERE user_id = ?`, [userId]);

    return rows[0].total;
};

// 토론 존재 여부 및 타입 확인
export const getDiscussionById = async (
    discussionId: number
): Promise<{ discussion_id: number; discussion_type: "FREE" | "VS" } | null> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT discussion_id, discussion_type
        FROM discussion
        WHERE discussion_id = ?`,
        [discussionId]
    );

    return rows.length ? (rows[0] as { discussion_id: number; discussion_type: "FREE" | "VS" }) : null;
};

// 토론 메시지 생성 (choice 추가)
export const insertDiscussionComment = async (
    discussionId: number,
    userId: number,
    content: string,
    choice: number | null
): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO discussion_comment (discussion_id, user_id, content, choice)
        VALUES (?, ?, ?, ?)`,
        [discussionId, userId, content, choice]
    );

    return result.insertId;
};

// 사용자가 특정 토론에 이미 메시지를 작성했는지 확인
export const hasUserCommentedOnDiscussion = async (discussionId: number, userId: number): Promise<boolean> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT 1
        FROM discussion_comment
        WHERE discussion_id = ? AND user_id = ?
        LIMIT 1`,
        [discussionId, userId]
    );

    return rows.length > 0;
};

// 사용자가 이미 투표했는지 확인
export const findVoteByUserAndDiscussion = async (
    userId: number,
    discussionId: number
): Promise<{ vote_id: number; choice: number } | null> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT vote_id, choice
        FROM vote
        WHERE user_id = ? AND discussion_id = ?`,
        [userId, discussionId]
    );

    return rows.length ? (rows[0] as { vote_id: number; choice: number }) : null;
};

// 투표 추가
export const insertVote = async (userId: number, discussionId: number, choice: number): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO vote (user_id, discussion_id, choice)
        VALUES (?, ?, ?)`,
        [userId, discussionId, choice]
    );

    return result.insertId;
};
