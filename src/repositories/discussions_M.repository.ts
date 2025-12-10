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

// 특정 토론 상세 조회
export const getDiscussionDetail = async (discussionId: number): Promise<DiscussionDetailRow | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT
      d.discussion_id,
      d.user_id,
      d.book_id,
      d.title,
      d.content,
      d.discussion_type,
      d.option1,
      d.option2,
      d.created_at,
      d.like_count,
      u.nickname,
      (
        SELECT COUNT(*) 
        FROM discussion_comment dc 
        WHERE dc.discussion_id = d.discussion_id
      ) AS comment_count
    FROM discussion d
    INNER JOIN user u ON u.user_id = d.user_id
    WHERE d.discussion_id = ?
    LIMIT 1
  `, [discussionId]);

  return rows.length ? (rows[0] as DiscussionDetailRow) : null;
};

export interface DiscussionDetailRow extends RowDataPacket {
  discussion_id: number;
  user_id: number;
  book_id: number;
  title: string;
  content: string;
  discussion_type: "FREE" | "VS";
  option1: string | null;
  option2: string | null;
  created_at: Date;
  like_count: number;
  comment_count: number;
  nickname: string;
}

// 특정 토론의 메시지(댓글)조회
export interface DiscussionMessageRow extends RowDataPacket {
  comment_id: number;
  discussion_id: number;
  user_id: number;
  nickname: string;
  content: string;
  choice: number | null;
  created_at: Date;
  updated_at: Date;
}

export const getDiscussionMessages = async (
  discussionId: number
): Promise<DiscussionMessageRow[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT 
      dc.comment_id,
      dc.discussion_id,
      dc.user_id,
      u.nickname,
      dc.choice,
      dc.content,
      dc.created_at,
      dc.updated_at
    FROM discussion_comment dc
    INNER JOIN user u ON dc.user_id = u.user_id
    WHERE dc.discussion_id = ?
    ORDER BY dc.created_at ASC
    `,
    [discussionId]
  );

  return rows as DiscussionMessageRow[];
};

// 이미 좋아요를 눌렀는지 확인
export const findDiscussionLike = async (
  userId: number,
  discussionId: number
) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT like_id
    FROM discussion_like
    WHERE user_id = ? AND discussion_id = ?
    `,
    [userId, discussionId]
  );

  return rows.length ? rows[0] : null;
};

// 좋아요 추가
export const addDiscussionLike = async (
  userId: number,
  discussionId: number
) => {
  const [result] = await pool.query<ResultSetHeader>(
    `
    INSERT INTO discussion_like (user_id, discussion_id)
    VALUES (?, ?)
    `,
    [userId, discussionId]
  );

  return result.insertId;
};

// 좋아요 갯수 1 증가
export const increaseDiscussionLikeCount = async (discussionId: number) => {
  await pool.query(
    `
    UPDATE discussion
    SET like_count = like_count + 1
    WHERE discussion_id = ?
    `,
    [discussionId]
  );
};

// 좋아요 취소
export const removeDiscussionLike = async (
  userId: number,
  discussionId: number
) => {
  await pool.query(
    `
    DELETE FROM discussion_like
    WHERE user_id = ? AND discussion_id = ?
    `,
    [userId, discussionId]
  );
};

// 좋아요 갯수 1 감소
export const decreaseDiscussionLikeCount = async (discussionId: number) => {
  await pool.query(
    `
    UPDATE discussion
    SET like_count = like_count - 1
    WHERE discussion_id = ? AND like_count > 0
    `,
    [discussionId]
  );
};

// 토론 좋아요 여부 조회
export const existsDiscussionLike = async (
  userId: number,
  discussionId: number
): Promise<boolean> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT 1 AS found
    FROM discussion_like
    WHERE user_id = ? AND discussion_id = ?
    LIMIT 1
    `,
    [userId, discussionId]
  );

  return rows.length > 0;
};

//특정 책 기본정보조회
export const getBookBasicInfo = async (bookId: number) => {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT 
      book_id,
      title,
      author,
      publisher,
      published_date,
      description,
      thumbnail_url,
      page_count
    FROM book
    WHERE book_id = ?
  `, [bookId]);

  return rows.length ? rows[0] : null;
};

//특정책에 연결된 장르 목록 조회
export const getGenresByBookId = async (bookId: number) => {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT g.genre_name
    FROM genre g
    INNER JOIN book_genre bg ON bg.genre_id = g.genre_id
    WHERE bg.book_id = ?
    ORDER BY g.genre_name
  `, [bookId]);

  return rows.map(r => r.genre_name);
};
