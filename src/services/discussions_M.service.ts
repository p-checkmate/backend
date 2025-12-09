import HttpError from "http-errors";
import { getBookById } from "../repositories/books.repository.js";
import { createDiscussion } from "../repositories/discussions_M.repository.js";
import { getDiscussionsByBook } from "../repositories/discussions_M.repository.js";

export const createDiscussionService = async (payload: {
    user_id: number;
    book_id: number;
    title: string;
    content: string;
    discussion_type: "FREE" | "VS";
    option1: string | null;
    option2: string | null;
}) => {
    try {
        //책 존재 여부 확인
        const book = await getBookById(payload.book_id);
        if (!book) {
            throw HttpError(404, "해당 도서를 찾을 수 없습니다.");
        }

        //VS 토론 옵션 검증
        if (payload.discussion_type === "VS") {
            if (!payload.option1 || !payload.option2) {
                throw HttpError(400, "VS 토론은 option1, option2가 필요합니다.");
            }
        }

        // FREE 토론
        const option1 = payload.discussion_type === "FREE" ? null : payload.option1;
        const option2 = payload.discussion_type === "FREE" ? null : payload.option2;

        //DB 저장
        const discussionId = await createDiscussion({
            ...payload,
            option1,
            option2,
        });

        return discussionId;

    } catch (err: any) {
        // 이미 HttpError면 그대로 throw
        if (err.status) throw err;

        console.error(err);
        throw HttpError(500, "토론 생성 중 오류가 발생했습니다.");
    }
};

// 특정 책 토론 목록 조회
export const getDiscussionsByBookService = async (bookId: number) => {
  // 책 존재 여부 검증
    const book = await getBookById(bookId);
    if (!book) {
    throw HttpError(404, "해당 도서를 찾을 수 없습니다.");
    }

    const discussions = await getDiscussionsByBook(bookId);
    return discussions;
};