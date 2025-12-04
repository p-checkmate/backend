import createHttpError from "http-errors";
import { BookmarkResponse } from "../schemas/books.schema.js";
import { findBookByItemId } from "../repositories/books.repository.js";
import { insertBookmark } from "../repositories/bookmarks.repository.js";
import { getBookDetail } from "./books.service.js";

export const addBookmark = async (userId: number, aladinItemId: number): Promise<BookmarkResponse> => {
    const bookRow = await findBookByItemId(aladinItemId.toString());
    if (!bookRow) {
        throw createHttpError(404, "책 정보를 찾을 수 없습니다.");
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
            throw createHttpError(409, "이미 북마크한 책입니다.");
        }
        throw err;
    }
};

export const selectFavoriteBooks = async (aladinItemIds: number[], userId: number): Promise<number[]> => {
    let bookIds: number[] = [];

    for (let itemId of aladinItemIds) {
        let bookInfo = await getBookDetail(itemId);

        let insertId = await insertBookmark(userId, bookInfo.bookId);
        if (!insertId) {
            throw createHttpError(500, "북마크 추가에 실패했습니다.");
        }
        bookIds.push(insertId);
    }
    return bookIds;
};
