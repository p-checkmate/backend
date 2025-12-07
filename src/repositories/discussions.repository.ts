import { pool } from "../config/db.config.js";
import { RowDataPacket, ResultSetHeader } from "mysql2";

/* 책 존재 여부 확인 */
export const getBookById = async (bookId: number) => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM book WHERE book_id = ?`,
        [bookId]
    );
    return rows[0] || null;
};

/* 토론 생성 */
export const createDiscussion = async (payload: {
    user_id: number;
    book_id: number;
    title: string;
    content: string;
    discussion_type: "FREE" | "VS";
    option1: string | null;
    option2: string | null;
}): Promise<number> => {

    const {
        user_id,
        book_id,
        title,
        content,
        discussion_type,
        option1,
        option2,
    } = payload;

    const [result] = await pool.query<ResultSetHeader>(
        `
        INSERT INTO discussion
            (user_id, book_id, title, content, discussion_type, option1, option2)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [user_id, book_id, title, content, discussion_type, option1, option2]
    );

    return result.insertId;
};

export const getDiscussionsByUserId = async () => {
    return []; 
};

export const countDiscussionsByUserId = async () => {
    return 0; 
};

export const getLikedDiscussionsByUserId = async () => {
  return []; 
};

export const countLikedDiscussionsByUserId = async () => {
    return 0; 
};