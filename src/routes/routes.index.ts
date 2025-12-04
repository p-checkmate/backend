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
import { handleSelectFavoriteBooks } from "../controllers/onboarding.controller.js";

export const routing: Routing = {
    api: {
        v1: {
            books: {
                search: handleSearchBooks,
                bestsellers: handleViewBestsellers,
                ":bookId": handleGetBookDetail,
                ":bookId/bookmark": handleAddBookmark,
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
            onboarding: {
                "favorite-books": handleSelectFavoriteBooks,
            },
        },
    },
};
