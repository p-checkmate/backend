import { pool } from "../config/db.config.js";
import { ResultSetHeader } from "mysql2/promise";


// 북마크 추가
export const insertBookmark = async (userId: number, bookId: number) => {
    try {
        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO bookmark (user_id, book_id) VALUES (?, ?)`,
            [userId, bookId],
        );
        return result.insertId;
    } catch (err: any) {
        if (err.code === "ER_DUP_ENTRY") {
            throw new Error("DUPLICATE_BOOKMARK");
        }
        throw err;
    }
};

// 북마크 삭제
export const deleteBookmark = async (
    userId: number,
    bookId: number,
) => {
    const [result] = await pool.query<ResultSetHeader>(
        `DELETE FROM bookmark WHERE user_id = ? AND book_id = ?`,
        [userId, bookId],
    );
    return result;
};