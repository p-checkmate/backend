import HttpError from "http-errors";
import { MypageOutput } from "../schemas/mypage.schema.js";
import { MyQuoteRow } from "../schemas/quotes.schema.js";
import { findGenresByBookId } from "../repositories/books.repository.js";
import { UserBookmarksResponse, BookmarkItem } from "../schemas/books.schema.js";
import { countBookmarksByUserId, getBookmarksWithPagination, } from "../repositories/bookmarks.repository.js";
import { getQuotesByUserId, countQuotesByUserId } from "../repositories/quotes.repository.js";
import {
    getUserById,
    getExpByUserId,
    getPreferredGenresByUserId,
    getBookmarksByUserId,
} from "../repositories/mypage.repository.js";

import {
    normalizePageLimit,
    calculatePagination,
    formatDateToYYMMDD,    
} from "../utils/data_utils.js";


// 마이페이지 전체 정보 조회
export const getMyPageInfo = async (userId: number): Promise<MypageOutput> => {
    const user = await getUserById(userId);

    if (!user) {
        throw HttpError(404, "사용자를 찾을 수 없습니다.");
    }

    const [expInfo, preferredGenres, bookmarks] = await Promise.all([
        getExpByUserId(userId),
        getPreferredGenresByUserId(userId),
        getBookmarksByUserId(userId),
    ]);

    return {
        user: {
            user_id: user.user_id,
            nickname: user.nickname,
            email: user.email,
            exp: expInfo?.exp ?? 0,
            level: expInfo?.level ?? 1,
            preferred_genres: preferredGenres,
        },
        my_bookshelf: bookmarks.map((bookmark) => ({
            book_id: bookmark.book_id,
            title: bookmark.title,
            author: bookmark.author,
            thumbnail_url: bookmark.thumbnail_url,
        })),
    };
};


// 나의 책장 전체 목록 조회 (무한 스크롤)
export const getUserBookmarks = async (
    userId: number,
    page: number,
    limit: number,
): Promise<UserBookmarksResponse> => {
    const { safePage, safeLimit } = normalizePageLimit(page, limit);

    const totalCount = await countBookmarksByUserId(userId);

    const pagination = calculatePagination({
        page: safePage,
        limit: safeLimit,
        totalCount,
    });

    const bookmarkRows = await getBookmarksWithPagination(
        userId,
        safePage,
        safeLimit,
    );

    const bookmarks: BookmarkItem[] = await Promise.all(
        bookmarkRows.map(async (row) => {
            const allGenres = await findGenresByBookId(row.book_id);
            const genres = allGenres.map((g) => g.genreName);

            return {
                bookmark_id: row.bookmark_id,
                book_id: row.book_id,
                title: row.title,
                author: row.author,
                thumbnail_url: row.thumbnail_url,
                genres,
            };
        }),
    );

    return {
        ...pagination, 
        bookmarks,
    };
};


// 내가 작성한 인용구 조회 
export const getMyQuotesService = async (
    userId: number,
    page: number,
    limit: number,
) => {
    // 공통 page/limit 보정 사용
    const { safePage, safeLimit } = normalizePageLimit(page, limit);

    // OFFSET 계산
    const offset = (safePage - 1) * safeLimit;

    try {
        const [quotes, totalCount] = await Promise.all([
            getQuotesByUserId(userId, safeLimit, offset),
            countQuotesByUserId(userId),
        ]);

        const data = quotes.map((row: MyQuoteRow) => ({
            quote_id: row.quote_id,
            content: row.content,
            like_count: row.like_count,
            created_at: formatDateToYYMMDD(row.created_at),
            book: {
                book_id: row.book_id,
                title: row.book_title,
                genres: row.genre_names ? row.genre_names.split(",") : [],
            },
            user: {
                nickname: row.nickname,
            },
        }));

        const pagination = calculatePagination({
            page: safePage,
            limit: safeLimit,
            totalCount,
        });

        return {
            ...pagination,
            quotes: data,
        };
    } catch (err) {
        console.error(err);
        throw HttpError(500, "내 인용구 조회에 실패했습니다.");
    }
};
