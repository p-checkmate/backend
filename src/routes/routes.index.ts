import { Routing } from "express-zod-api";
import { handleGetReadingGroupList } from "../controllers/reading_groups.controller.js";


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
    handleDeleteBookmark
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

import { handleCreateDiscussion } from "../controllers/discussions.controller.js";

import {
    handleSelectFavoriteBooks,
    handleSelectFavoriteGenres,
    handleGetGenres,
} from "../controllers/onboarding.controller.js";

export const routing: Routing = {
    api: {
        v1: {
            // -----------------------------------
            // 📚 BOOKS
            // -----------------------------------
            books: {
                search: handleSearchBooks,
                bestsellers: handleViewBestsellers,

                // ⭐ 여기만 수정됨: 반드시 객체로 묶어야 함
                ":bookId": {
                    get: handleGetBookDetail,

                    "post bookmark": handleAddBookmark,
                    "delete bookmark": handleDeleteBookmark,

                    "get quotes": handleGetQuotesByBook,
                    "post quotes": handleCreateQuote,

                    "post discussions": handleCreateDiscussion,
                },
            },

            // -----------------------------------
            // 🔐 AUTH
            // -----------------------------------
            auth: {
                login: handleLogin,
                refresh: handleRefreshToken,
                signup: handleSignup,
                logout: handleLogout,
                me: handleWithdrawUser,
            },

            // -----------------------------------
            // 👤 USERS
            // -----------------------------------
            users: {
                mypage: handleGetMyPage,
                me: handleModifyUser,
                "bookmarks/books": handleGetMyBookshelf,
                "my-quotes": handleGetMyQuotes,
                "my-discussions": handleGetMyDiscussions,
                "like/quotes": handleGetLikedQuotes,
                "like/discussions": handleGetLikedDiscussions,
            },

            // -----------------------------------
            // 📝 QUOTES 단건 조작
            // -----------------------------------
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

            // -----------------------------------
            // 🧭 ONBOARDING
            // -----------------------------------
            onboarding: {
                "favorite-books": handleSelectFavoriteBooks,
                "post favorite-genres": handleSelectFavoriteGenres,
                "get favorite-genres": handleGetGenres,
            },

            // -----------------------------------
            // 👥 독서 모임
            // -----------------------------------
            "reading-groups": {
                list: handleGetReadingGroupList,
            },
        },
    },
};
