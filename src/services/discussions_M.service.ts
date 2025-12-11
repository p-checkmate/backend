import HttpError from "http-errors";
import { getBookById } from "../repositories/books.repository.js";
import {
    createDiscussion,
    getDiscussionsByBook,
    getDiscussionDetail,
    getDiscussionMessages,
    findDiscussionLike,
    addDiscussionLike,
    increaseDiscussionLikeCount,
    removeDiscussionLike,
    decreaseDiscussionLikeCount,
    existsDiscussionLike,
} from "../repositories/discussions_M.repository.js";


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

import { getBookBasicInfo, getGenresByBookId } from "../repositories/discussions_M.repository.js";

export const getDiscussionsByBookService = async (bookId: number) => {
  const bookRow = await getBookBasicInfo(bookId);
  if (!bookRow) {
    throw HttpError(404, "해당 도서를 찾을 수 없습니다.");
  }
  const genres = await getGenresByBookId(bookId);
  const discussions = await getDiscussionsByBook(bookId);
  const book = {
    bookId: bookRow.book_id,
    itemId: bookRow.aladin_item_id ?? "", 
    title: bookRow.title,
    author: bookRow.author,
    publisher: bookRow.publisher,
    publishedDate: bookRow.published_date
      ? bookRow.published_date.toISOString().slice(0, 10) // "YYYY-MM-DD"
      : null,
    description: bookRow.description,
    thumbnailUrl: bookRow.thumbnail_url,
    page: bookRow.page_count ?? bookRow.page ?? null,
    genres,
  };
  return {
    book,
    discussions,
  };
};

//토론상세조회
export const getDiscussionDetailService = async (discussionId: number) => {
    const discussion = await getDiscussionDetail(discussionId);

    if (!discussion) {
    throw HttpError(404, "해당 토론을 찾을 수 없습니다.");
    }

    return discussion;
};

//토론 메시지내용조회
export const getDiscussionMessagesService = async (discussionId: number) => {
  // 토론 존재 여부 확인
    const discussion = await getDiscussionDetail(discussionId);
    if (!discussion) {
    throw HttpError(404, "해당 토론을 찾을 수 없습니다.");
    }

    const messages = await getDiscussionMessages(discussionId);
    return messages;
};

// 토론 좋아요 등록
export const likeDiscussionService = async (
    userId: number,
    discussionId: number
) => {
  // 토론 존재 여부 확인
    const discussion = await getDiscussionDetail(discussionId);
    if (!discussion) {
    throw HttpError(404, "해당 토론을 찾을 수 없습니다.");
    }

  // 이미 좋아요를 눌렀는지 확인
    const alreadyLiked = await findDiscussionLike(userId, discussionId);
    if (alreadyLiked) {
    throw HttpError(400, "이미 좋아요를 누른 토론입니다.");
    }

  // 좋아요 등록 &count 증가
    await addDiscussionLike(userId, discussionId);
    await increaseDiscussionLikeCount(discussionId);

    return { message: "토론 좋아요가 등록되었습니다." };
};

// 토론 좋아요 취소
export const unlikeDiscussionService = async (
    userId: number,
    discussionId: number
) => {
  // 토론 존재 여부 확인
    const discussion = await getDiscussionDetail(discussionId);
    if (!discussion) {
    throw HttpError(404, "해당 토론을 찾을 수 없습니다.");
    }

  // 좋아요 여부 확인
    const liked = await findDiscussionLike(userId, discussionId);
    if (!liked) {
    throw HttpError(400, "좋아요를 누르지 않은 토론입니다.");
    }

  // 좋아요 삭제 & count 감소
    await removeDiscussionLike(userId, discussionId);
    await decreaseDiscussionLikeCount(discussionId);

    return { message: "토론 좋아요가 취소되었습니다." };
};

// 토론 좋아요 여부 조회
export const getDiscussionLikeStatusService = async (
  discussionId: number,
  userId: number
) => {
  // 토론 존재 여부 확인
  const discussion = await getDiscussionDetail(discussionId);
  if (!discussion) {
    throw HttpError(404, "해당 토론을 찾을 수 없습니다.");
  }

  // 좋아요 여부 확인
  const isLiked = await existsDiscussionLike(userId, discussionId);

  return { isLiked };
};