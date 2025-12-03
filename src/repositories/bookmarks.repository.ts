// src/repositories/bookmarks.repository.ts
import { pool } from "../config/db.config.js";
import { ResultSetHeader } from "mysql2/promise";

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

