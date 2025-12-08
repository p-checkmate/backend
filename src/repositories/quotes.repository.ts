import { pool } from "../config/db.config.js";
import { QuoteRow, MyQuoteRow } from "../schemas/quotes.schema.js";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

// 인용구 생성
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

// 인용구 단건 조회
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

// 책별 인용구 리스트 조회
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

  return rows;
};

// 인용구 수정
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

// 인용구 삭제
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

// 좋아요 증가
export const likeQuote = async (quoteId: number, userId: number) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [exists] = await conn.query<RowDataPacket[]>(
      `SELECT * FROM quote_like WHERE quote_id = ? AND user_id = ?`,
      [quoteId, userId]
    );

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

    const [result] = await conn.query<ResultSetHeader>(
      `DELETE FROM quote_like WHERE quote_id = ? AND user_id = ?`,
      [quoteId, userId]
    );

    if (result.affectedRows > 0) {
      await conn.query<ResultSetHeader>(
        `
        UPDATE quote 
        SET like_count = like_count - 1 
        WHERE quote_id = ? AND like_count > 0
        `,
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

// 인용구 리스트 조회 헬퍼 함수 (내가 작성한 / 좋아요한 공통)
const getQuotesWithDetails = async (
  userId: number,
  limit: number,
  offset: number,
  type: "written" | "liked"
): Promise<MyQuoteRow[]> => {
  const isLiked = type === "liked";

  const [rows] = await pool.query<MyQuoteRow[]>(
    `
      SELECT 
          q.quote_id,
          q.content,
          q.like_count,
          q.created_at,
          b.book_id,
          b.title AS book_title,
          GROUP_CONCAT(DISTINCT g.genre_name) AS genre_names,
          u.nickname
          ${isLiked ? ", MAX(ql.like_id) AS liked_at" : ""}
      FROM ${isLiked ? "quote_like ql INNER JOIN quote q ON ql.quote_id = q.quote_id" : "quote q"}
      INNER JOIN book b ON q.book_id = b.book_id
      INNER JOIN user u ON q.user_id = u.user_id
      LEFT JOIN book_genre bg ON b.book_id = bg.book_id
      LEFT JOIN genre g ON bg.genre_id = g.genre_id
      WHERE ${isLiked ? "ql" : "q"}.user_id = ?
      GROUP BY q.quote_id
      ORDER BY ${isLiked ? "liked_at" : "q.created_at"} DESC
      LIMIT ? OFFSET ?
    `,
    [userId, limit, offset]
  );

  return rows;
};

// 사용자별 인용구 리스트 조회 (책 정보 포함)
export const getQuotesByUserId = async (
  userId: number,
  limit: number,
  offset: number
): Promise<MyQuoteRow[]> => {
  return getQuotesWithDetails(userId, limit, offset, "written");
};

// 사용자가 좋아요한 인용구 리스트 조회 (책 정보 포함)
export const getLikedQuotesByUserId = async (
  userId: number,
  limit: number,
  offset: number
): Promise<MyQuoteRow[]> => {
  return getQuotesWithDetails(userId, limit, offset, "liked");
};

// 사용자 인용구 개수 조회
export const countQuotesByUserId = async (userId: number): Promise<number> => {
  const [rows] = await pool.query<any[]>(
    `SELECT COUNT(*) AS total FROM quote WHERE user_id = ?`,
    [userId]
  );
  return rows[0].total;
};

// 사용자가 좋아요한 인용구 개수
export const countLikedQuotesByUserId = async (
  userId: number
): Promise<number> => {
  const [rows] = await pool.query<any[]>(
    `SELECT COUNT(*) AS total FROM quote_like WHERE user_id = ?`,
    [userId]
  );
  return rows[0].total;
};
