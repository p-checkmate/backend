import { pool } from "../config/db.config.js";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { BookmarkRow, BookGenreRow } from "../schemas/books.schema.js";

// 북마크 추가
export const insertBookmark = async (userId: number, bookId: number) => {
    try {
        const [result] = await pool.query<ResultSetHeader>(`INSERT INTO bookmark (user_id, book_id) VALUES (?, ?)`, [
            userId,
            bookId,
        ]);
        return result.insertId;
    } catch (err: any) {
        if (err.code === "ER_DUP_ENTRY") {
            throw new Error("DUPLICATE_BOOKMARK");
        }
        throw err;
    }
};

// 북마크 삭제
export const deleteBookmark = async (userId: number, bookId: number) => {
    const [result] = await pool.query<ResultSetHeader>(`DELETE FROM bookmark WHERE user_id = ? AND book_id = ?`, [
        userId,
        bookId,
    ]);
    return result;
};

// 사용자 북마크 총 개수 조회
export const countBookmarksByUserId = async (userId: number): Promise<number> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total_count
        FROM bookmark
        WHERE user_id = ?`,
        [userId]
    );

    return rows[0].total_count;
};

// 사용자 북마크 목록 조회 
export const getBookmarksWithPagination = async (
    userId: number,
    page: number,
    limit: number
): Promise<BookmarkRow[]> => {
    const offset = (page - 1) * limit;

    const [rows] = await pool.query<BookmarkRow[]>(
        `SELECT 
            bm.bookmark_id,
            b.book_id,
            b.title,
            b.author,
            b.thumbnail_url
        FROM bookmark bm
        INNER JOIN book b ON bm.book_id = b.book_id
        WHERE bm.user_id = ?
        ORDER BY bm.bookmark_id DESC
        LIMIT ? OFFSET ?`,
        [userId, limit, offset]
    );

    return rows;
};

// 북마크 존재 여부 조회 (user_id + book_id)
export const existsBookmark = async (userId: number, bookId: number): Promise<boolean> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT 1 AS found
            FROM bookmark
            WHERE user_id = ? AND book_id = ?
            LIMIT 1`,
        [userId, bookId],
    );

    return rows.length > 0;
};
