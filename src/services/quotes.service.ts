import HttpError from "http-errors";
import {
  createQuote,
  getQuoteById,
  updateQuote,
  deleteQuote,
  likeQuote,
  unlikeQuote,
  getQuotesByBookId,
  existsQuoteLike
} from "../repositories/quotes.repository.js";

// CREATE
export const createQuoteService = async (userId: number, bookId: number, content: string) => {
  try {
    return await createQuote(userId, bookId, content);
  } catch (err) {
    console.error(err);
    throw HttpError(500, "인용구 생성에 실패했습니다.");
  }
};

// READ 단건
export const getQuoteService = async (quoteId: number) => {
  const quote = await getQuoteById(quoteId);
  if (!quote) throw HttpError(404, "존재하지 않는 인용구입니다.");

return {
    ...quote,
    created_at: quote.created_at.toISOString(),
    updated_at: quote.updated_at ? quote.updated_at.toISOString() : null,
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

    book: {
      title: row.title,
      author: row.author,
      publisher: row.publisher,
      published_date: row.published_date,
      description: row.description,
      thumbnail_url: row.thumbnail_url,
      page_count: row.page_count,
      genres: row.genres
        ? row.genres.split(",").map((g: string) => g.trim())
        : [],
    },
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
