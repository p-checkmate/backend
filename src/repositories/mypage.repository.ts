import { pool } from "../config/db.config.js";
import {
    UserRow,
    ExpRow,
    GenreRow,
    BookmarkBookRow
} from "../schemas/mypage.schema.js";
import { ResultSetHeader } from "mysql2/promise"; 

// 사용자 정보 조회
export const getUserById = async (userId: number): Promise<UserRow | null> => {
    const [rows] = await pool.query<UserRow[]>(
        `SELECT user_id, nickname, email
        FROM user
        WHERE user_id = ?`,
        [userId]
    );

    return rows[0] || null;
};

// 사용자 경험치 정보 조회
export const getExpByUserId = async (userId: number): Promise<ExpRow | null> => {
    const [rows] = await pool.query<ExpRow[]>(
        `SELECT exp, level
        FROM user_exp
        WHERE user_id = ?`,
        [userId]
    );

    return rows[0] || null;
};

// 사용자 선호 장르 조회 
export const getPreferredGenresByUserId = async (userId: number): Promise<string[]> => {
    const [rows] = await pool.query<GenreRow[]>(
        `SELECT DISTINCT og.genre_name
        FROM user_genre ug
        INNER JOIN onboarding_genre og ON ug.onboarding_genre_id = og.onboarding_genre_id
        WHERE ug.user_id = ?`,
        [userId]
    );

    return rows.map(row => row.genre_name);
};

// 북마크한 책 목록 조회
export const getBookmarksByUserId = async (userId: number, limit: number = 4): Promise<BookmarkBookRow[]> => {
    const [rows] = await pool.query<BookmarkBookRow[]>(
        `SELECT 
            b.book_id,
            b.aladin_item_id AS item_id,
            b.title,
            b.author,
            b.thumbnail_url
        FROM bookmark bm
        INNER JOIN book b ON bm.book_id = b.book_id
        WHERE bm.user_id = ?
        LIMIT ?`,
        [userId, limit]
    );

    return rows;
};

// 사용자 경험치·레벨 업데이트 (없으면 INSERT)
export const updateUserExpAndLevel = async (
    userId: number,
    exp: number,
    level: number
): Promise<void> => {
    const [result] = await pool.query<ResultSetHeader>(
        `UPDATE user_exp
         SET exp = ?, level = ?
         WHERE user_id = ?`,
        [exp, level, userId]
    );

    // 해당 유저 row가 없으면 새로 생성
    if (result.affectedRows === 0) {
        await pool.query<ResultSetHeader>(
            `INSERT INTO user_exp (user_id, exp, level)
             VALUES (?, ?, ?)`,
            [userId, exp, level]
        );
    }
};

