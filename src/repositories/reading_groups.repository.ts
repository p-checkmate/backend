import { pool } from "../config/db.config.js";
import { ResultSetHeader } from "mysql2/promise";

// 함께 읽기 그룹 생성
export const insertReadingGroup = async (
    bookId: number,
    startDate: string,
    endDate: string
): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO reading_group (book_id, start_date, end_date)
        VALUES (?, ?, ?)`,
        [bookId, startDate, endDate]
    );

    return result.insertId;
};


