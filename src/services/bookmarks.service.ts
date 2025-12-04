import HttpError from "http-errors";
import { BookmarkResponse } from "../schemas/books.schema.js";
import { findBookByItemId } from "../repositories/books.repository.js";
import {
    insertBookmark,
    deleteBookmark,
} from "../repositories/bookmarks.repository.js";

// 북마크 추가 
export const addBookmark = async (
    userId: number,
    aladinItemId: number,
): Promise<BookmarkResponse> => {

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