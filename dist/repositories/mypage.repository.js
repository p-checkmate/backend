import { pool } from "../config/db.config.js";
// 사용자 정보 조회
export const getUserById = async (userId) => {
    const [rows] = await pool.query(`SELECT user_id, nickname, email
        FROM user
        WHERE user_id = ?`, [userId]);
    return rows[0] || null;
};
// 사용자 경험치 정보 조회
export const getExpByUserId = async (userId) => {
    const [rows] = await pool.query(`SELECT exp, level
        FROM user_exp
        WHERE user_id = ?`, [userId]);
    return rows[0] || null;
};
// 사용자 선호 장르 조회 
export const getPreferredGenresByUserId = async (userId) => {
    const [rows] = await pool.query(`SELECT DISTINCT g.genre_name
        FROM user_genre ug
        INNER JOIN genre g ON ug.genre_id = g.genre_id
        WHERE ug.user_id = ?`, [userId]);
    return rows.map(row => row.genre_name);
};
// 북마크한 책 목록 조회
export const getBookmarksByUserId = async (userId, limit = 4) => {
    const [rows] = await pool.query(`SELECT 
            b.book_id,
            b.title,
            b.author,
            b.thumbnail_url
        FROM bookmark bm
        INNER JOIN book b ON bm.book_id = b.book_id
        WHERE bm.user_id = ?
        LIMIT ?`, [userId, limit]);
    return rows;
};
