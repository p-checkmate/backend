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
      books: {
        search: handleSearchBooks,
        bestsellers: handleViewBestsellers,

        ":bookId": {
          get: handleGetBookDetail,
          "post bookmark": handleAddBookmark,
          "get quotes": handleGetQuotesByBook,
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
        "get :quoteId": handleGetQuote,
        "patch :quoteId": handleUpdateQuote,
        "delete :quoteId": handleDeleteQuote,
        "post :quoteId/like": handleLikeQuote,
        "delete :quoteId/like": handleUnlikeQuote,
      },
    },
  },
};
