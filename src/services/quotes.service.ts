import HttpError from "http-errors";
import {
  createQuote,
  getQuoteById,
  getQuoteDetailById,
  updateQuote,
  deleteQuote,
  likeQuote,
  unlikeQuote,
  getQuotesByBookId,
  hasUserQuotedBook,
  existsQuoteLike,
  findPopularQuotes 
} from "../repositories/quotes.repository.js";
import { addExpToUser } from "./mypage.service.js";
import { CreateQuoteResponse } from "../schemas/quotes.schema.js";

// CREATE
export const createQuoteService = async (
  userId: number,
  bookId: number,
  content: string
): Promise<CreateQuoteResponse> => {
  const EXP_REWARD = 10;

  try {
    // 해당 책에 인용구를 작성한 적 있는지 확인
    const hasQuoted = await hasUserQuotedBook(userId, bookId);

    const quoteId = await createQuote(userId, bookId, content);

    let expEarned = 0;

    // 첫 인용구인 경우에만 경험치 부여
    if (!hasQuoted) {
      await addExpToUser(userId, EXP_REWARD);
      expEarned = EXP_REWARD;
    }

    return {
      quote_id: quoteId,
      exp_earned: expEarned,
    };
  } catch (err) {
    console.error(err);
    throw HttpError(500, "인용구 생성에 실패했습니다.");
  }
};

// READ 단건
export const getQuoteService = async (quoteId: number) => {
  const row = await getQuoteDetailById(quoteId);
  if (!row) throw HttpError(404, "존재하지 않는 인용구입니다.");

  return {
    quote_id: row.quote_id,
    user_id: row.user_id,
    nickname: row.nickname,
    book_id: row.book_id,
    content: row.content,
    like_count: row.like_count,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at ? row.updated_at.toISOString() : null,

    book: {
      title: row.title,
      author: row.author,
      publisher: row.publisher,
      published_date: row.published_date?.toISOString() ?? null,
      description: row.description,
      thumbnail_url: row.thumbnail_url,
      page_count: row.page_count,
      genres: row.genres ? row.genres.split(",") : [],
    },
  };
};

// 도서별 인용구 조회
export const getQuotesByBookService = async (bookId: number) => {
  const rows = await getQuotesByBookId(bookId);

  return rows.map((row) => ({
    quote_id: row.quote_id,
    user_id: row.user_id,
    nickname: row.nickname,
    book_id: row.book_id,
    content: row.content,
    like_count: row.like_count,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at ? row.updated_at.toISOString() : null,
  }));
};

// UPDATE
export const updateQuoteService = async (quoteId: number, content: string, userId: number) => {
  const quote = await getQuoteById(quoteId);
  if (!quote) throw HttpError(404, "존재하지 않는 인용구입니다.");

  const success = await updateQuote(quoteId, content, userId);
  if (!success) throw HttpError(403, "본인의 인용구만 수정할 수 있습니다.");

  return true;
};

// DELETE
export const deleteQuoteService = async (quoteId: number, userId: number) => {
  const quote = await getQuoteById(quoteId);
  if (!quote) throw HttpError(404, "존재하지 않는 인용구입니다.");

  const success = await deleteQuote(quoteId, userId);
  if (!success) throw HttpError(403, "본인의 인용구만 삭제할 수 있습니다.");

  return true;
};

// LIKE
export const likeQuoteService = async (quoteId: number, userId: number) => {
  const quote = await getQuoteById(quoteId);
  if (!quote) throw HttpError(404, "존재하지 않는 인용구입니다.");

  const result = await likeQuote(quoteId, userId);
  if (!result.inserted) {
    throw HttpError(400, "이미 좋아요를 누른 상태입니다.");
  }

  return true;
};

//UNLIKE
export const unlikeQuoteService = async (quoteId: number, userId: number) => {
  const quote = await getQuoteById(quoteId);
  if (!quote) throw HttpError(404, "존재하지 않는 인용구입니다.");
  
  const result = await unlikeQuote(quoteId, userId);
  if (!result || result.affectedRows === 0) {
    throw HttpError(400, "좋아요한 기록이 없습니다.");
  }

  return true;
};


//LIKE status
export const getQuoteLikeStatusService = async (
  quoteId: number,
  userId: number
) => {
  const quote = await getQuoteById(quoteId);
  if (!quote) throw HttpError(404, "존재하지 않는 인용구입니다.");

  const liked = await existsQuoteLike(userId, quoteId);
  return { liked };
};

//POPULAR quotes
export const getPopularQuotesService = async () => {
    const rawData = await findPopularQuotes();

    const formatted = rawData.map((q) => ({
        quote_id: q.quote_id,
        content: q.content,
        like_count: q.like_count,
        created_at: new Date(q.created_at).toISOString(),
        
        book: {
            book_id: q.book_id,
            title: q.book_title,
            genres: q.genre_names ? q.genre_names.split(",") : [],
        },
        user: {
            nickname: q.nickname,
        },
    }));

    return { quotes: formatted };
};
