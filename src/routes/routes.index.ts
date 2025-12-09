import { Routing } from "express-zod-api";
import { 
  handleCreateReadingGroup,
  handleGetReadingGroupOverview,
  handleGetReadingGroupList,
  handleJoinReadingGroup 
} from "../controllers/reading_groups.controller.js";

import {
  handleGetMyPage,
  handleGetMyBookshelf,
  handleGetMyQuotes,
  handleGetMyDiscussions,
  handleGetLikedQuotes,
  handleGetLikedDiscussions,
} from "../controllers/mypage.controller.js";

import {
  handleSearchBooks,
  handleGetBookDetail,
  handleViewBestsellers,
  handleAddBookmark,
  handleDeleteBookmark,
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

import {
  handleSelectFavoriteBooks,
  handleSelectFavoriteGenres,
  handleGetGenres,
} from "../controllers/onboarding.controller.js";

import { handleCreateDiscussion } from "../controllers/discussions_M.controller.js";


export const routing: Routing = {
  api: {
    v1: {
      quotes: {
        "get :quoteId": handleGetQuote,
        "patch :quoteId": handleUpdateQuote,
        "delete :quoteId": handleDeleteQuote,
        "post :quoteId/like": handleLikeQuote,
        "delete :quoteId/like": handleUnlikeQuote,
      },

      books: {
        search: handleSearchBooks,
        bestsellers: handleViewBestsellers,

        ":bookId": handleGetBookDetail,
        ":bookId/bookmark": handleAddBookmark,
        "delete /:bookId/bookmark": handleDeleteBookmark,
        "get :bookId/quotes": handleGetQuotesByBook,
        "post :bookId/quotes": handleCreateQuote,
        "post :bookId/discussions": handleCreateDiscussion,
      },


      auth: {
        login: handleLogin,
        refresh: handleRefreshToken,
        signup: handleSignup,
        logout: handleLogout,
        me: handleWithdrawUser,
      },

      users: {
        mypage: handleGetMyPage,
        me: handleModifyUser,
        "bookmarks/books": handleGetMyBookshelf,
        "my-quotes": handleGetMyQuotes,
        "my-discussions": handleGetMyDiscussions,
        "like/quotes": handleGetLikedQuotes,
        "like/discussions": handleGetLikedDiscussions,
      },

      onboarding: {
        "favorite-books": handleSelectFavoriteBooks,
        "post favorite-genres": handleSelectFavoriteGenres,
        "get favorite-genres": handleGetGenres,
      },

      "reading-groups": {
        create: handleCreateReadingGroup,
        list: handleGetReadingGroupList,
        ":groupId/overview": handleGetReadingGroupOverview,
        ":groupId/join": handleJoinReadingGroup,
      },
    },
  },
}
