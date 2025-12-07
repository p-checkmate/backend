import { pool } from "../config/db.config.js";
// itemId(aladin_item_id)로 책 조회
export const findBookByItemId = async (itemId) => {
    const [rows] = await pool.query(`SELECT book_id, aladin_item_id, title, author, publisher,
                published_date, description, thumbnail_url, page_count
        FROM book 
        WHERE aladin_item_id = ?`, [itemId]);
    return rows.length ? rows[0] : null;
};
// 책에 연결된 장르 조회
export const findGenresByBookId = async (bookId) => {
    const [rows] = await pool.query(`SELECT g.genre_id, g.genre_name
        FROM genre g
        INNER JOIN book_genre bg ON g.genre_id = bg.genre_id
        WHERE bg.book_id = ?`, [bookId]);
    return rows.map((row) => ({
        genreId: row.genre_id,
        genreName: row.genre_name,
    }));
};
// 책 정보 저장
export const insertBook = async (book, page) => {
    const [result] = await pool.query(`INSERT INTO book (aladin_item_id, title, author, publisher, published_date, description, thumbnail_url, page_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
        book.itemId.toString(),
        book.title.substring(0, 100),
        book.author?.substring(0, 100) ?? null,
        book.publisher?.substring(0, 100) ?? null,
        book.pubDate ?? null,
        book.description ?? null,
        book.cover?.substring(0, 500) ?? null,
        page,
    ]);
    return result.insertId;
};
// 장르명으로 장르 조회 (없으면 생성)
export const findOrCreateGenre = async (genreName) => {
    const trimmedName = genreName.substring(0, 50);
    const [existing] = await pool.query(`SELECT genre_id FROM genre WHERE genre_name = ?`, [trimmedName]);
    if (existing.length > 0) {
        return existing[0].genre_id;
    }
    const [result] = await pool.query(`INSERT INTO genre (genre_name) VALUES (?)`, [trimmedName]);
    return result.insertId;
};
// 책-장르 연결
export const linkBookGenre = async (bookId, genreId) => {
    await pool.query(`INSERT IGNORE INTO book_genre (book_id, genre_id) VALUES (?, ?)`, [bookId, genreId]);
};
// book_id로 책 조회
export const getBookById = async (bookId) => {
    const [rows] = await pool.query(`SELECT book_id, aladin_item_id, title, author, publisher,
                published_date, description, thumbnail_url, page_count
        FROM book 
        WHERE book_id = ?`, [bookId]);
    return rows.length ? rows[0] : null;
};
