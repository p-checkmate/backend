import HttpError from "http-errors";
import { MypageOutput } from "../schemas/mypage.schema.js";
import {
    getUserById,
    getExpByUserId,
    getPreferredGenresByUserId,
    getBookmarksByUserId
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
