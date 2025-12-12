import { pool } from "../config/db.config.js";
import { BookRow, GenreRow, BookDetailResponse, Genre, PopularBookRow } from "../schemas/books.schema.js";
import { AladinBookItem } from "../schemas/aladin.schema.js";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// itemId(aladin_item_id)로 책 조회
export const findBookByItemId = async (itemId: string): Promise<BookRow | null> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT book_id, aladin_item_id, title, author, publisher,
                published_date, description, thumbnail_url, page_count
        FROM book 
        WHERE aladin_item_id = ?`,
        [itemId]
    );

    return rows.length ? (rows[0] as BookRow) : null;
};

// 책에 연결된 장르 조회
export const findGenresByBookId = async (bookId: number): Promise<Genre[]> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT g.genre_id, g.genre_name
        FROM genre g
        INNER JOIN book_genre bg ON g.genre_id = bg.genre_id
        WHERE bg.book_id = ?`,
        [bookId]
    );

    return (rows as GenreRow[]).map((row) => ({
        genreId: row.genre_id,
        genreName: row.genre_name,
    }));
};

// 책 정보 저장
export const insertBook = async (book: AladinBookItem, page: number | null): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO book (aladin_item_id, title, author, publisher, published_date, description, thumbnail_url, page_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            book.itemId.toString(),
            book.title.substring(0, 100),
            book.author?.substring(0, 100) ?? null,
            book.publisher?.substring(0, 100) ?? null,
            book.pubDate ?? null,
            book.description ?? null,
            book.cover?.substring(0, 500) ?? null,
            page,
        ]
    );

    return result.insertId;
};

// 장르명으로 장르 조회 (없으면 생성)
export const findOrCreateGenre = async (genreName: string): Promise<number> => {
    const trimmedName = genreName.substring(0, 50);

    const [existing] = await pool.query<RowDataPacket[]>(`SELECT genre_id FROM genre WHERE genre_name = ?`, [
        trimmedName,
    ]);

    if (existing.length > 0) {
        return (existing[0] as GenreRow).genre_id;
    }

    const [result] = await pool.query<ResultSetHeader>(`INSERT INTO genre (genre_name) VALUES (?)`, [trimmedName]);

    return result.insertId;
};

// 책-장르 연결
export const linkBookGenre = async (bookId: number, genreId: number): Promise<void> => {
    await pool.query(`INSERT IGNORE INTO book_genre (book_id, genre_id) VALUES (?, ?)`, [bookId, genreId]);
};

// book_id로 책 조회
export const getBookById = async (bookId: number): Promise<BookRow | null> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT book_id, aladin_item_id, title, author, publisher,
                published_date, description, thumbnail_url, page_count
        FROM book 
        WHERE book_id = ?`,
        [bookId]
    );

    return rows.length ? (rows[0] as BookRow) : null;
};

// 인기 도서 조회
export const findBooksByBookmarkCount = async (): Promise<PopularBookRow[]> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT
            b.aladin_item_id AS item_id, 
            b.thumbnail_url, 
            COUNT(bm.book_id) AS bookmark_count
        FROM 
            book AS b 
        LEFT JOIN 
            bookmark AS bm ON b.book_id = bm.book_id
        GROUP BY 
            b.aladin_item_id, b.thumbnail_url
        ORDER BY 
            bookmark_count DESC
        LIMIT 10;`
    );

    return rows as PopularBookRow[];
};

// 함께 읽기 기본 책 생성을 위한 INSERT 함수
export const insertBookForReadingGroup = async (params: {
    aladinItemId: string;         
    title: string;
    author?: string | null;
    publisher?: string | null;
    publishedDate?: string | null; 
    description?: string | null;
    thumbnailUrl?: string | null;
    pageCount?: number | null;
}): Promise<number> => {
    const {
        aladinItemId,
        title,
        author = null,
        publisher = null,
        publishedDate = null,
        description = null,
        thumbnailUrl = null,
        pageCount = null,
    } = params;

    const [result] = await pool.query<ResultSetHeader>(
        `
        INSERT INTO book (
            aladin_item_id,
            title,
            author,
            publisher,
            published_date,
            description,
            thumbnail_url,
            page_count
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            aladinItemId,
            title,
            author,
            publisher,
            publishedDate, 
            description,
            thumbnailUrl,
            pageCount,
        ]
    );

    return result.insertId;
};