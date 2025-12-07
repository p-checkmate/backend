import { pool } from "../config/db.config.js";
/* 책 존재 여부 확인 */
export const getBookById = async (bookId) => {
    const [rows] = await pool.query(`SELECT * FROM book WHERE book_id = ?`, [bookId]);
    return rows[0] || null;
};
/* 토론 생성 */
export const createDiscussion = async (payload) => {
    const { user_id, book_id, title, content, discussion_type, option1, option2, } = payload;
    const [result] = await pool.query(`
        INSERT INTO discussion
            (user_id, book_id, title, content, discussion_type, option1, option2)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [user_id, book_id, title, content, discussion_type, option1, option2]);
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
