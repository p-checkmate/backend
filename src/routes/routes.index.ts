import { Routing } from "express-zod-api";
import { handleGetMyPage, handleGetMyBookshelf } from "../controllers/mypage.controller.js";
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

export const routing: Routing = {
    api: {
        v1: {
            books: {
                search: handleSearchBooks,
                bestsellers: handleViewBestsellers,

                ":bookId": handleGetBookDetail,
                ":bookId/bookmark": handleAddBookmark,
                "delete /:bookId/bookmark": handleDeleteBookmark,

                ":bookId/quotes": {
                    get: handleGetQuotesByBook,
                    post: handleCreateQuote,
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
                mypage: handleGetMyPage,
                me: handleModifyUser,
                "bookmarks/books": handleGetMyBookshelf,
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

            onboarding: {
                "favorite-books": handleSelectFavoriteBooks,
                "favorite-genres": {
                    post: handleSelectFavoriteGenres,
                    get: handleGetGenres,
                },
            },
        },
    },
};
