import HttpError from "http-errors";
import { MypageOutput } from "../schemas/mypage.schema.js";
import { UserBookmarksResponse, BookmarkItem } from "../schemas/books.schema.js";
import {
    getUserById,
    getExpByUserId,
    getPreferredGenresByUserId,
    getBookmarksByUserId
} from "../repositories/mypage.repository.js";
import {
    countBookmarksByUserId,
    getBookmarksWithPagination,
} from "../repositories/bookmarks.repository.js";
import { findGenresByBookId } from "../repositories/books.repository.js";

// 마이페이지 전체 정보 조회
export const getMyPageInfo = async (userId: number): Promise<MypageOutput> => {
    const user = await getUserById(userId);

    if (!user) {
        throw HttpError(404, "사용자를 찾을 수 없습니다.");
    }

    const [expInfo, preferredGenres, bookmarks] = await Promise.all([
        getExpByUserId(userId),
        getPreferredGenresByUserId(userId),
        getBookmarksByUserId(userId)
    ]);

    return {
        user: {
            user_id: user.user_id,
            nickname: user.nickname,
            email: user.email,
            exp: expInfo?.exp ?? 0,
            level: expInfo?.level ?? 1,
            preferred_genres: preferredGenres
        },
        my_bookshelf: bookmarks.map(bookmark => ({
            book_id: bookmark.book_id,
            title: bookmark.title,
            author: bookmark.author,
            thumbnail_url: bookmark.thumbnail_url
        }))
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