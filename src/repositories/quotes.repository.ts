import { pool } from "../config/db.config.js";
import { QuoteRow } from "../schemas/quotes.schema.js";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";


//인용구생성
export const createQuote = async (
  userId: number,
  bookId: number,
  content: string
): Promise<number> => {
  const [result] = await pool.query<any>(
    `
      INSERT INTO quote (user_id, book_id, content)
      VALUES (?, ?, ?)
    `,
    [userId, bookId, content]
  );

  return result.insertId;
};

//인용구 단건 조회
// <repository> 파일 내 getQuoteById 함수 수정
export const getQuoteById = async (
  quoteId: number
): Promise<QuoteRow | null> => {
  const [rows] = await pool.query<QuoteRow[]>(
    `
      SELECT 
        q.quote_id,
        q.user_id,
        u.nickname,
        q.book_id,
        q.content,
        q.like_count,
        q.created_at,
        q.updated_at
      FROM quote q
      INNER JOIN user u ON q.user_id = u.user_id 
      WHERE q.quote_id = ?
    `,
    [quoteId]
  );
  return rows[0] || null;
};

//책별 인용구 리스트 조회
export const getQuotesByBookId = async (
  bookId: number
): Promise<QuoteRow[]> => {
  const [rows] = await pool.query<QuoteRow[]>(
   `
      SELECT 
        q.quote_id,
        q.user_id,
        u.nickname,
        q.book_id,
        q.content,
        q.like_count,
        q.created_at,
        q.updated_at
      FROM quote q
      INNER JOIN user u ON q.user_id = u.user_id
      WHERE q.book_id = ?
      ORDER BY q.created_at DESC
    `,
    [bookId]
  );

  return rows; // 없으면 빈 배열 []
};

//인용구 수정(본인만)
export const updateQuote = async (
  quoteId: number,
  content: string,
  userId: number
): Promise<boolean> => {
  const [result] = await pool.query<any>(
    `
      UPDATE quote
      SET content = ?, updated_at = NOW()
      WHERE quote_id = ? AND user_id = ?
    `,
    [content, quoteId, userId]
  );
  return result.affectedRows > 0;
};

//인용구 삭제(본인만)
export const deleteQuote = async (
  quoteId: number,
  userId: number
): Promise<boolean> => {
  const [result] = await pool.query<any>(
    `
      DELETE FROM quote
      WHERE quote_id = ? AND user_id = ?
    `,
    [quoteId, userId]
  );
  return result.affectedRows > 0;
};

//좋아요 증가
export const likeQuote = async (quoteId: number, userId: number) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [exists] = await conn.query<RowDataPacket[]>(
      `SELECT * FROM quote_like WHERE quote_id = ? AND user_id = ?`,
      [quoteId, userId]
    );

    // 이미 좋아요 눌렀다면 false 리턴
    if (exists.length > 0) {
      await conn.rollback();
      return { inserted: false };
    }
    await conn.query(
      `INSERT INTO quote_like (quote_id, user_id) VALUES (?, ?)`,
      [quoteId, userId]
    );
    await conn.query(
      `UPDATE quote SET like_count = like_count + 1 WHERE quote_id = ?`,
      [quoteId]
    );

    await conn.commit();

    return { inserted: true };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};


// 좋아요 감소
export const unlikeQuote = async (quoteId: number, userId: number) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. 좋아요 삭제 
    const [result] = await conn.query<ResultSetHeader>(
      `DELETE FROM quote_like WHERE quote_id = ? AND user_id = ?`,
      [quoteId, userId]
    );

    // 2. 실제 삭제된 경우에만 like_count 감소
    if (result.affectedRows > 0) {
      await conn.query<ResultSetHeader>(
        `UPDATE quote 
         SET like_count = like_count - 1 
         WHERE quote_id = ? AND like_count > 0`,
        [quoteId]
      );
    }

    await conn.commit();
    return result;  
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
