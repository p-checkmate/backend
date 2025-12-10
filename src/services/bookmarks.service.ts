import HttpError from "http-errors";
import { BookmarkResponse } from "../schemas/books.schema.js";
import { findBookByItemId } from "../repositories/books.repository.js";
import { insertBookmark, deleteBookmark, existsBookmark } from "../repositories/bookmarks.repository.js";
import { getBookDetail } from "./books.service.js";

// 북마크 추가
export const addBookmark = async (userId: number, aladinItemId: number): Promise<BookmarkResponse> => {
    const bookRow = await findBookByItemId(aladinItemId.toString());
    if (!bookRow) {
        throw HttpError(404, "책 정보를 찾을 수 없습니다.");
    }

    try {
        const bookmarkId = await insertBookmark(userId, bookRow.book_id);
        return {
            bookmarkId,
            userId,
            bookId: aladinItemId,
        };
    } catch (err: any) {
        if (err.message === "DUPLICATE_BOOKMARK") {
            throw HttpError(409, "이미 북마크한 책입니다.");
        }
        throw err;
    }
};

// 북마크 삭제
export const removeBookmark = async (userId: number, aladinItemId: number) => {
    const bookRow = await findBookByItemId(aladinItemId.toString());
    if (!bookRow) {
        throw HttpError(404, "책 정보를 찾을 수 없습니다.");
    }

    const result = await deleteBookmark(userId, bookRow.book_id);

    if (result.affectedRows === 0) {
        throw HttpError(404, "북마크가 존재하지 않습니다.");
    }
};

// 책 북마크 여부 조회
export const getBookmarkStatus = async (userId: number, aladinItemId: number): Promise<boolean> => {
    const bookRow = await findBookByItemId(aladinItemId.toString());
    if (!bookRow) {
        throw HttpError(404, "책 정보를 찾을 수 없습니다.");
    }

    // DB book_id 기준으로 존재 여부 확인
    const isBookmarked = await existsBookmark(userId, bookRow.book_id);
    return isBookmarked;
};


// 온보딩 시 좋아하는 책 북마크
export const selectFavoriteBooks = async (aladinItemIds: number[], userId: number): Promise<number[]> => {
    let bookmarkIds: number[] = [];

    for (let itemId of aladinItemIds) {
        let bookInfo = await getBookDetail(itemId);

        let insertId = await insertBookmark(userId, bookInfo.bookId);
        if (!insertId) {
            throw HttpError(500, "북마크 추가에 실패했습니다.");
        }
        bookmarkIds.push(insertId);
    }
    return bookmarkIds;
};