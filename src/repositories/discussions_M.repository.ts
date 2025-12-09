import { NumberLiteralType } from "typescript";
import { pool } from "../config/db.config.js";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

// DiscussionRow 타입 (DB 구조 기반)
export interface DiscussionRow extends RowDataPacket {
  discussion_id: number;
  user_id: number;
  book_id: number;
  title: string;
  content: string;
  discussion_type: "FREE" | "VS";
  option1: string | null;
  option2: string | null;
  created_at: Date;
  updated_at: Date;
  nickname: string; 
  comment_count: number;
  like_count: number; 
}

//책 존재여부 확인
export const getBookById = async (
  bookId: number
): Promise<{ book_id: number } | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT book_id
    FROM book
    WHERE book_id = ?
    `,
    [bookId]
  );

  return rows.length ? (rows[0] as { book_id: number }) : null;
};

//토론 생성 
export interface CreateDiscussionPayload {
  user_id: number;
  book_id: number;
  title: string;
  content: string;
  discussion_type: "FREE" | "VS";
  option1: string | null;
  option2: string | null;

}

export const createDiscussion = async (
  payload: CreateDiscussionPayload
): Promise<number> => {
  const {
    user_id,
    book_id,
    title,
    content,
    discussion_type,
    option1,
    option2,
  } = payload;

  const [result] = await pool.query<ResultSetHeader>(
    `
    INSERT INTO discussion (
      user_id,
      book_id,
      title,
      content,
      discussion_type,
      option1,
      option2
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [user_id, book_id, title, content, discussion_type, option1, option2]
  );

  return result.insertId;
};

// 특정 책 토론 목록 조회
export const getDiscussionsByBook = async (
  bookId: number
): Promise<DiscussionRow[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT 
      d.discussion_id,
      d.title,
      d.content,
      d.discussion_type,
      d.option1,
      d.option2,
      d.created_at,
      d.like_count,
      u.nickname,
      COUNT(dc.comment_id) AS comment_count
    FROM discussion d
    INNER JOIN user u ON d.user_id = u.user_id
    LEFT JOIN discussion_comment dc ON dc.discussion_id = d.discussion_id
    WHERE d.book_id = ?
    GROUP BY d.discussion_id
    ORDER BY d.created_at DESC
    `,
    [bookId]
  );

  return rows as DiscussionRow[];
};
