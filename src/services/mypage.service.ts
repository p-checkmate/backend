import HttpError from "http-errors";
import { MypageOutput } from "../schemas/mypage.schema.js";
import { MyQuoteRow } from "../schemas/quotes.schema.js";
import { findGenresByBookId } from "../repositories/books.repository.js";
import { UserBookmarksResponse, BookmarkItem } from "../schemas/books.schema.js";
import { countBookmarksByUserId, getBookmarksWithPagination } from "../repositories/bookmarks.repository.js";
import { getQuotesByUserId, countQuotesByUserId } from "../repositories/quotes.repository.js";
import { MyDiscussionRow, MyDiscussionsResponse } from "../schemas/discussions.schema.js";
import {
    getDiscussionsByUserId,
    countDiscussionsByUserId,
} from "../repositories/discussions.repository.js";
import {
    getUserById,
    getExpByUserId,
    getPreferredGenresByUserId,
    getBookmarksByUserId,
} from "../repositories/mypage.repository.js";

// 페이지네이션 입력값 검증 및 메타데이터 계산 헬퍼 함수
const processPagination = (page: number, limit: number, totalCount: number) => {
    const safePage = page > 0 ? page : 1;
    const safeLimit = limit > 0 ? limit : 10;
    const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / safeLimit);
    const offset = (safePage - 1) * safeLimit;
    const hasNext = safePage * safeLimit < totalCount;

    return {
        safePage,
        safeLimit,
        totalPages,
        offset,
        hasNext,
    };
};

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
    const totalCount = await countBookmarksByUserId(userId);
    const { safePage, safeLimit, totalPages, hasNext } = processPagination(page, limit, totalCount);

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

    return {
        page: safePage,
        limit: safeLimit,
        total_count: totalCount,
        total_pages: totalPages,
        has_next: hasNext,
        bookmarks,
    };
};

// 내가 작성한 인용구 조회 (페이지네이션)
export const getMyQuotesService = async (
    userId: number,
    page: number,
    limit: number
) => {
    const totalCount = await countQuotesByUserId(userId);
    const { safePage, safeLimit, totalPages, offset, hasNext } = processPagination(page, limit, totalCount);

    try {
        const quotes = await getQuotesByUserId(userId, safeLimit, offset);

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
            page: safePage,
            limit: safeLimit,
            total_count: totalCount,
            total_pages: totalPages,
            has_next: hasNext,
            quotes: data,
        };
    } catch (err) {
        console.error(err);
        throw HttpError(500, "내 인용구 조회에 실패했습니다.");
    }
};

// 내가 작성한 토론 조회 (페이지네이션)
export const getMyDiscussionsService = async (
    userId: number,
    page: number,
    limit: number
): Promise<MyDiscussionsResponse> => {
    const totalCount = await countDiscussionsByUserId(userId);
    const { safePage, safeLimit, totalPages, offset, hasNext } = processPagination(page, limit, totalCount);

    try {
        const discussions = await getDiscussionsByUserId(userId, safeLimit, offset);

        const data = discussions.map((row: MyDiscussionRow) => {
            const date = new Date(row.created_at);
            const yy = String(date.getFullYear()).slice(-2);
            const mm = String(date.getMonth() + 1).padStart(2, "0");
            const dd = String(date.getDate()).padStart(2, "0");

            return {
                discussion_id: row.discussion_id,
                title: row.title,
                content: row.content,
                view_count: row.view_count,
                like_count: row.like_count,
                comment_count: row.comment_count,
                created_at: `${yy}.${mm}.${dd}`,
                book: {
                    book_id: row.book_id,
                    title: row.book_title,
                },
                user: {
                    nickname: row.nickname,
                },
            };
        });

        return {
            page: safePage,
            limit: safeLimit,
            total_count: totalCount,
            total_pages: totalPages,
            has_next: hasNext,
            discussions: data,
        };
    } catch (err) {
        console.error(err);
        throw HttpError(500, "내 토론 조회에 실패했습니다.");
    }
};