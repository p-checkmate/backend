import { Routing } from "express-zod-api";

import {
  handleSearchBooks,
  handleGetBookDetail,
  handleViewBestsellers,
  handleAddBookmark,
} from "../controllers/books.controller.js";

import {
  handleLogin,
  handleRefreshToken,
  handleSignup,
  handleLogout,
  handleWithdrawUser,
} from "../controllers/auth.controller.js";

import { handleModifyUser } from "../controllers/users.controller.js";

import {
  handleCreateQuote,
  handleGetQuote,
  handleUpdateQuote,
  handleDeleteQuote,
  handleLikeQuote,
  handleUnlikeQuote,
  handleGetQuotesByBook,
} from "../controllers/quotes.controller.js";

export const routing: Routing = {
  api: {
    v1: {
      // ------------------------
      // 📚 BOOKS
      // ------------------------
      books: {
        search: handleSearchBooks,
        bestsellers: handleViewBestsellers,

        ":bookId": {
          get: handleGetBookDetail,

          // POST /api/v1/books/:bookId/bookmark
          "post bookmark": handleAddBookmark,

          // GET /api/v1/books/:bookId/quotes
          "get quotes": handleGetQuotesByBook,

          // POST /api/v1/books/:bookId/quotes
          "post quotes": handleCreateQuote,
        },
      },

      auth: {
        "post login": handleLogin,
        "post refresh": handleRefreshToken,
        "post signup": handleSignup,
        "post logout": handleLogout,
        "delete me": handleWithdrawUser,
      },

      users: {
        "patch me": handleModifyUser,
      },

      quotes: {
        // GET /api/v1/quotes/:quoteId
        "get :quoteId": handleGetQuote,

        // PATCH /api/v1/quotes/:quoteId
        "patch :quoteId": handleUpdateQuote,

        // DELETE /api/v1/quotes/:quoteId
        "delete :quoteId": handleDeleteQuote,

        // POST /api/v1/quotes/:quoteId/like
        "post :quoteId/like": handleLikeQuote,

        // DELETE /api/v1/quotes/:quoteId/like
        "delete :quoteId/like": handleUnlikeQuote,
      },
    },
  },
};
