import { Routing } from "express-zod-api";
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

export const routing: Routing = {
    api: {
        v1: {
            books: {
                search: handleSearchBooks,
                bestsellers: handleViewBestsellers,
                ":bookId": handleGetBookDetail,  
                ":bookId/bookmark": handleAddBookmark,
                "delete /:bookId/bookmark": handleDeleteBookmark,
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
        },
    },
};
