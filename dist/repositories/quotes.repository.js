import { pool } from "../config/db.config.js";
//인용구생성
export const createQuote = async (userId, bookId, content) => {
    const [result] = await pool.query(`
      INSERT INTO quote (user_id, book_id, content)
      VALUES (?, ?, ?)
    `, [userId, bookId, content]);
    return result.insertId;
};
//인용구 단건 조회
export const getQuoteById = async (quoteId) => {
    const [rows] = await pool.query(`SELECT * FROM quote WHERE quote_id = ?`, [quoteId]);
    return rows[0] || null;
};
//책별 인용구 리스트 조회
export const getQuotesByBookId = async (bookId) => {
    const [rows] = await pool.query(`
      SELECT *
      FROM quote
      WHERE book_id = ?
      ORDER BY created_at DESC
    `, [bookId]);
    return rows; // 없으면 빈 배열 []
};
//인용구 수정(본인만)
export const updateQuote = async (quoteId, content, userId) => {
    const [result] = await pool.query(`
      UPDATE quote
      SET content = ?, updated_at = NOW()
      WHERE quote_id = ? AND user_id = ?
    `, [content, quoteId, userId]);
    return result.affectedRows > 0;
};
//인용구 삭제(본인만)
export const deleteQuote = async (quoteId, userId) => {
    const [result] = await pool.query(`
      DELETE FROM quote
      WHERE quote_id = ? AND user_id = ?
    `, [quoteId, userId]);
    return result.affectedRows > 0;
};
// 좋아요 증가
export const likeQuote = async (quoteId, userId) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        // 좋아요 중복 여부 확인
        const [rows] = await conn.query(`SELECT * FROM quote_like WHERE quote_id = ? AND user_id = ?`, [quoteId, userId]);
        if (rows.length > 0) {
            await conn.rollback();
            return;
        }
        await conn.query(`INSERT INTO quote_like (quote_id, user_id) VALUES (?, ?)`, [quoteId, userId]);
        await conn.query(`UPDATE quote SET like_count = like_count + 1 WHERE quote_id = ?`, [quoteId]);
        await conn.commit();
    }
    catch (err) {
        await conn.rollback();
        throw err;
    }
    finally {
        conn.release();
    }
};
// 좋아요 삭제
export const unlikeQuote = async (quoteId, userId) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        // 좋아요 여부 확인
        const [rows] = await conn.query(`SELECT * FROM quote_like WHERE quote_id = ? AND user_id = ?`, [quoteId, userId]);
        // 좋아요가 없으면 취소 불가 
        if (rows.length === 0) {
            await conn.rollback();
            return;
        }
        // 좋아요 삭제
        await conn.query(`DELETE FROM quote_like WHERE quote_id = ? AND user_id = ?`, [quoteId, userId]);
        // like_count 감소 (음수방지)
        await conn.query(`UPDATE quote SET like_count = like_count - 1 WHERE quote_id = ? AND like_count > 0`, [quoteId]);
        await conn.commit();
    }
    catch (err) {
        await conn.rollback();
        throw err;
    }
    finally {
        conn.release();
    }
};
// 사용자별 인용구 리스트 조회 (책 정보 포함)
export const getQuotesByUserId = async (userId, limit, offset) => {
    const [rows] = await pool.query(`
        SELECT 
            q.quote_id,
            q.content,
            q.like_count,
            q.created_at,
            b.book_id,
            b.title AS book_title,
            GROUP_CONCAT(DISTINCT g.genre_name) AS genre_names,
            u.nickname
        FROM quote q
        INNER JOIN book b ON q.book_id = b.book_id
        INNER JOIN user u ON q.user_id = u.user_id
        LEFT JOIN book_genre bg ON b.book_id = bg.book_id
        LEFT JOIN genre g ON bg.genre_id = g.genre_id
        WHERE q.user_id = ?
        GROUP BY q.quote_id
        ORDER BY q.created_at DESC
        LIMIT ? OFFSET ?
        `, [userId, limit, offset]);
    return rows;
};
// 사용자 인용구 총 개수 조회
export const countQuotesByUserId = async (userId) => {
    const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM quote WHERE user_id = ?`, [userId]);
    return rows[0].total;
};
