import HttpError from "http-errors";
import {
getBookById,
} from "../repositories/books.repository.js";

import{createDiscussion} from "../repositories/discussions.repository.js"

//토론생성 서비스
export const createDiscussionService = async (payload: {
  user_id: number;
  book_id: number;
  title: string;
  content: string;
  discussion_type: "FREE" | "VS";
  option1: string | null;
  option2: string | null;
}) => {

  //책 존재 여부 확인
  const book = await getBookById(payload.book_id);
  if (!book) throw HttpError(404, "존재하지 않는 도서입니다.");

  //FREE토론일 경우 옵션 제거
if (payload.discussion_type === "FREE") {
  payload.option1 = null;
  payload.option2 = null;
}

  //vs 토론일때 옵션 체크
  if (payload.discussion_type === "VS") {
    if (!payload.option1 || !payload.option2) {
      throw HttpError(400, "VS 토론은 option1, option2가 필요합니다.");
    }
  }

  //DB에 저장
  try {
    const discussionId = await createDiscussion(payload);
    return discussionId;
  } catch (err) {
    console.error(err);
    throw HttpError(500, "토론 생성 중 오류가 발생했습니다.");
  }
};