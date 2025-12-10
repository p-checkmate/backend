import HttpError from "http-errors";
import { MypageOutput } from "../schemas/mypage.schema.js";
import { UserBookmarksResponse, BookmarkItem } from "../schemas/books.schema.js";
import { MyQuoteRow } from "../schemas/quotes.schema.js";
import { MyDiscussionRow, MyDiscussionsResponse } from "../schemas/discussions.schema.js";
import { findGenresByBookId } from "../repositories/books.repository.js";
import { countBookmarksByUserId, getBookmarksWithPagination } from "../repositories/bookmarks.repository.js";
import {
    getQuotesByUserId,
    countQuotesByUserId,
    getLikedQuotesByUserId,
    countLikedQuotesByUserId,
} from "../repositories/quotes.repository.js";
import {
    getDiscussionsByUserId,
    countDiscussionsByUserId,
    getLikedDiscussionsByUserId,
    countLikedDiscussionsByUserId,
} from "../repositories/discussions.repository.js";
import {
    getUserById,
    getExpByUserId,
    getPreferredGenresByUserId,
    getBookmarksByUserId,
    updateUserExpAndLevel,
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

// 경험치 기반 레벨 계산 헬퍼 함수
const calculateLevel = (exp: number): number => {
    if (exp >= 1000) return 5;
    if (exp >= 500) return 4;
    if (exp >= 200) return 3;
    if (exp >= 100) return 2;
    return 1; // 0~99
};


// 인용구 데이터 변환 헬퍼 함수
const transformQuoteData = (row: MyQuoteRow) => {
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
};

// 토론 데이터 변환 헬퍼 함수
const transformDiscussionData = (row: MyDiscussionRow) => {
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

    const currentExp = expInfo?.exp ?? 0;
    const calculatedLevel = calculateLevel(currentExp);
    // DB의 레벨 정보가 현재 경험치 기반 레벨과 다르면 업데이트
    if (!expInfo || expInfo.level !== calculatedLevel) {
        await updateUserExpAndLevel(userId, currentExp, calculatedLevel);
    }

    return {
        user: {
            user_id: user.user_id,
            nickname: user.nickname,
            email: user.email,
            exp: currentExp,
            level: calculatedLevel,
            preferred_genres: preferredGenres,
        },
        my_bookshelf: bookmarks.map((bookmark) => ({
            book_id: bookmark.book_id,
            item_id: bookmark.item_id,   
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
                item_id: row.item_id,
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
        const data = quotes.map(transformQuoteData);

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
        const data = discussions.map(transformDiscussionData);

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

// 내가 좋아요한 인용구 조회 (페이지네이션)
export const getLikedQuotesService = async (
    userId: number,
    page: number,
    limit: number
) => {
    const totalCount = await countLikedQuotesByUserId(userId);
    const { safePage, safeLimit, totalPages, offset, hasNext } = processPagination(page, limit, totalCount);

    try {
        const quotes = await getLikedQuotesByUserId(userId, safeLimit, offset);
        const data = quotes.map(transformQuoteData);

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
        throw HttpError(500, "좋아요한 인용구 조회에 실패했습니다.");
    }
};

// 내가 좋아요한 토론 조회 (페이지네이션)
export const getLikedDiscussionsService = async (
    userId: number,
    page: number,
    limit: number
): Promise<MyDiscussionsResponse> => {
    const totalCount = await countLikedDiscussionsByUserId(userId);
    const { safePage, safeLimit, totalPages, offset, hasNext } = processPagination(page, limit, totalCount);

    try {
        const discussions = await getLikedDiscussionsByUserId(userId, safeLimit, offset);
        const data = discussions.map(transformDiscussionData);

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
        throw HttpError(500, "좋아요한 토론 조회에 실패했습니다.");
    }
};

// 사용자 경험치 추가 및 레벨업 처리
export const addExpToUser = async (userId: number, gainedExp: number) => {
    const expInfo = await getExpByUserId(userId);

    const prevExp = expInfo?.exp ?? 0;
    const prevLevel = expInfo?.level ?? calculateLevel(prevExp);

    const nextExp = prevExp + gainedExp;
    const nextLevel = calculateLevel(nextExp);

    await updateUserExpAndLevel(userId, nextExp, nextLevel);

    return {
        prevExp,
        nextExp,
        prevLevel,
        nextLevel,
        leveledUp: nextLevel > prevLevel,
    };
};
