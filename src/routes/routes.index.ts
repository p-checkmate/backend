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
          bookmark: handleAddBookmark,
          quotes: {
            get: handleGetQuotesByBook,
            post: handleCreateQuote,
          },
        },
      },
      auth: {
        login: handleLogin,
        refresh: handleRefreshToken,
        signup: handleSignup,
        logout: handleLogout,
        me: handleWithdrawUser,
      },
      users: {
        me: handleModifyUser,
      },
      quotes: {
        ":quoteId": {
          get: handleGetQuote,
          patch: handleUpdateQuote,
          delete: handleDeleteQuote,
          like: {
            post: handleLikeQuote,
            delete: handleUnlikeQuote,
          },
        },
      },
    },
  },
};
