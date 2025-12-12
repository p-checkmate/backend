import { z } from "zod";
import { defaultEndpointsFactory } from "express-zod-api";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createQuoteService,
  getQuoteService,
  getQuotesByBookService,
  updateQuoteService,
  deleteQuoteService,
  likeQuoteService,
  unlikeQuoteService,
  getQuoteLikeStatusService,
} from "../services/quotes.service.js";
import { quoteWithBookSchema, quoteSchema, createQuoteResponseSchema, quoteLikeStatusSchema } from "../schemas/quotes.schema.js";

import { getPopularQuotesService } from "../services/quotes.service.js";
import { popularQuoteResponseSchema } from "../schemas/quotes.schema.js";

const authEndpointsFactory = defaultEndpointsFactory.addMiddleware(authMiddleware);

//인용구 생성
export const handleCreateQuote = authEndpointsFactory.build({
  method: "post",
  input: z.object({
    bookId: z.coerce.number().int().positive(),
    content: z.string().min(1).max(500),
  }),
  output: createQuoteResponseSchema,

  handler: async ({ input, options }) => {
    const userId = options.user.user_id;
    return await createQuoteService(userId, input.bookId, input.content);
  },
});

//인용구 조회
export const handleGetQuote = authEndpointsFactory.build({
  method: "get",
  input: z.object({
    quoteId: z.coerce.number().int().positive(),
  }),
  output: quoteSchema,

  handler: async ({ input }) => {
    return await getQuoteService(input.quoteId);
  },
});

//인용구 수정
export const handleUpdateQuote = authEndpointsFactory.build({
  method: "patch",
  input: z.object({
    quoteId: z.coerce.number().int().positive(),
    content: z.string().min(1).max(500),
  }),
  output: z.object({ success: z.boolean() }),

  handler: async ({ input, options }) => {
    const userId = options.user.user_id;
    const success = await updateQuoteService(input.quoteId, input.content, userId);
    return { success };
  },
});

//인용구 삭제
export const handleDeleteQuote = authEndpointsFactory.build({
  method: "delete",
  input: z.object({
    quoteId: z.coerce.number().int().positive(),
  }),
  output: z.object({ success: z.boolean() }),

  handler: async ({ input, options }) => {
    const userId = options.user.user_id;
    const success = await deleteQuoteService(input.quoteId, userId);
    return { success };
  },
});

//인용구 좋아요
export const handleLikeQuote = authEndpointsFactory.build({
  method: "post",
  input: z.object({
    quoteId: z.coerce.number().int().positive(),
  }),
  output: z.object({ success: z.boolean() }),

  handler: async ({ input, options }) => {
    const userId = options.user.user_id;
    await likeQuoteService(input.quoteId, userId);
    return { success: true };
  },
});

//인용구 좋아요 취소
export const handleUnlikeQuote = authEndpointsFactory.build({
  method: "delete",
  input: z.object({
    quoteId: z.coerce.number().int().positive(),
  }),
  output: z.object({ success: z.boolean() }),

  handler: async ({ input, options }) => {
    const userId = options.user.user_id;
    await unlikeQuoteService(input.quoteId, userId);
    return { success: true };
  },
});

//도서별 인용구 조회
export const handleGetQuotesByBook = authEndpointsFactory.build({
  method: "get",
  input: z.object({
    bookId: z.coerce.number().int().positive(),
  }),
  output: z.object({
    data: z.array(quoteWithBookSchema),
  }),

  handler: async ({ input }) => {
    const quotes = await getQuotesByBookService(input.bookId);
    return { data: quotes };
  },
});

// 인용구 좋아요 여부 조회
export const handleGetQuoteLikeStatus = authEndpointsFactory.build({
  method: "get",
  input: z.object({
    quoteId: z.coerce.number().int().positive(),
  }),
  output: quoteLikeStatusSchema,

  handler: async ({ input, options }) => {
    const userId = options.user.user_id;
    return await getQuoteLikeStatusService(input.quoteId, userId);
  },
});

//인기토론조회
export const handleGetPopularQuotes = defaultEndpointsFactory.build({
    method: "get",
    input: z.object({}),
    output: popularQuoteResponseSchema,

    handler: async () => {
        return await getPopularQuotesService();
    },
});