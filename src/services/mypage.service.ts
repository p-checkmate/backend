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
    limit: number
): Promise<UserBookmarksResponse> => {
    // page / limit 기본값 및 안전한 값으로 보정
    const safePage = page > 0 ? page : 1;
    const safeLimit = limit > 0 ? limit : 10;

    // 전체 북마크 개수 조회 
    const totalCount = await countBookmarksByUserId(userId);

    // 전체 페이지 수 계산
    const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / safeLimit);

    // 현재 페이지 기준으로 북마크 목록 가져오기
    const bookmarkRows = await getBookmarksWithPagination(userId, safePage, safeLimit);

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
        })
    );

    // 응답 반환
    return {
        page: safePage,
        limit: safeLimit,
        total_count: totalCount,
        total_pages: totalPages,
        has_next: safePage * safeLimit < totalCount,
        bookmarks,
    };
};

// 내가 작성한 인용구 조회 (페이지네이션)
export const getMyQuotesService = async (
    userId: number,
    page: number,
    limit: number
) => {
    const offset = (page - 1) * limit;

    try {
        const [quotes, total] = await Promise.all([
            getQuotesByUserId(userId, limit, offset),
            countQuotesByUserId(userId),
        ]);

        const data = quotes.map((row: MyQuoteRow) => {
            const date = new Date(row.created_at);
            const yy = String(date.getFullYear()).slice(-2);
            const mm = String(date.getMonth() + 1).padStart(2, "0");
            const dd = String(date.getDate()).padStart(2, "0");

            return {
                quote_id: row.quote_id,
                content: row.content,
                like_count: row.like_count,
                created_at: `${yy}.${mm}.${dd}`,
                book: {
                    book_id: row.book_id,
                    title: row.book_title,
                    genres: row.genre_names ? row.genre_names.split(",") : [],
                },
                user: {
                    nickname: row.nickname,
                },
            };
        });

        return {
            page,
            limit,
            total_count: total,
            total_pages: Math.ceil(total / limit),
            has_next: page * limit < total,
            quotes: data,
        };
    } catch (err) {
        console.error(err);
        throw HttpError(500, "내 인용구 조회에 실패했습니다.");
    }
};