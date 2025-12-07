import HttpError from "http-errors";
import { createQuote, getQuoteById, updateQuote, deleteQuote, likeQuote, unlikeQuote, getQuotesByBookId, } from "../repositories/quotes.repository.js";
// CREATE
export const createQuoteService = async (userId, bookId, content) => {
    try {
        return await createQuote(userId, bookId, content);
    }
    catch (err) {
        console.error(err);
        throw HttpError(500, "인용구 생성에 실패했습니다.");
    }
};
// READ 단건
export const getQuoteService = async (quoteId) => {
    const quote = await getQuoteById(quoteId);
    if (!quote)
        throw HttpError(404, "존재하지 않는 인용구입니다.");
    return quote;
};
// READ by book
export const getQuotesByBookService = async (bookId) => {
    try {
        return await getQuotesByBookId(bookId);
    }
    catch (err) {
        console.error(err);
        throw HttpError(500, "도서별 인용구 조회 실패");
    }
};
// UPDATE
export const updateQuoteService = async (quoteId, content, userId) => {
    const quote = await getQuoteById(quoteId);
    if (!quote)
        throw HttpError(404, "존재하지 않는 인용구입니다.");
    const success = await updateQuote(quoteId, content, userId);
    if (!success)
        throw HttpError(403, "본인의 인용구만 수정할 수 있습니다.");
    return true;
};
// DELETE
export const deleteQuoteService = async (quoteId, userId) => {
    const quote = await getQuoteById(quoteId);
    if (!quote)
        throw HttpError(404, "존재하지 않는 인용구입니다.");
    const success = await deleteQuote(quoteId, userId);
    if (!success)
        throw HttpError(403, "본인의 인용구만 삭제할 수 있습니다.");
    return true;
};
// LIKE
export const likeQuoteService = async (quoteId, userId) => {
    const quote = await getQuoteById(quoteId);
    if (!quote)
        throw HttpError(404, "존재하지 않는 인용구입니다.");
    try {
        await likeQuote(quoteId, userId);
    }
    catch (err) {
        console.error(err);
        throw HttpError(500, "좋아요 처리 실패");
    }
};
// UNLIKE
export const unlikeQuoteService = async (quoteId, userId) => {
    const quote = await getQuoteById(quoteId);
    if (!quote)
        throw HttpError(404, "존재하지 않는 인용구입니다.");
    try {
        await unlikeQuote(quoteId, userId);
    }
    catch (err) {
        console.error(err);
        throw HttpError(500, "좋아요 취소 실패");
    }
};
