import { pool } from "../config/db.config.js";
// 북마크 추가
export const insertBookmark = async (userId, bookId) => {
    try {
        const [result] = await pool.query(`INSERT INTO bookmark (user_id, book_id) VALUES (?, ?)`, [
            userId,
            bookId,
        ]);
        return result.insertId;
    }
    catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            throw new Error("DUPLICATE_BOOKMARK");
        }
        throw err;
    }
};
// 북마크 삭제
export const deleteBookmark = async (userId, bookId) => {
    const [result] = await pool.query(`DELETE FROM bookmark WHERE user_id = ? AND book_id = ?`, [
        userId,
        bookId,
    ]);
    return result;
};
// 사용자 북마크 총 개수 조회
export const countBookmarksByUserId = async (userId) => {
    const [rows] = await pool.query(`SELECT COUNT(*) AS total_count
        FROM bookmark
        WHERE user_id = ?`, [userId]);
    return rows[0].total_count;
};
// 사용자 북마크 목록 조회 
export const getBookmarksWithPagination = async (userId, page, limit) => {
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(`SELECT 
            bm.bookmark_id,
            b.book_id,
            b.title,
            b.author,
            b.thumbnail_url
        FROM bookmark bm
        INNER JOIN book b ON bm.book_id = b.book_id
        WHERE bm.user_id = ?
        ORDER BY bm.bookmark_id DESC
        LIMIT ? OFFSET ?`, [userId, limit, offset]);
    return rows;
};
