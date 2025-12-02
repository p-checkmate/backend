import { Routing } from "express-zod-api";
import { handleSearchBooks, handleGetBookDetail } from "../controllers/books.controller.js";

import {
    handleLogin,
    handleRefreshToken,
    handleSignup,
    handleLogout,
    handleWithdrawUser,
} from "../controllers/auth.controller.js";


export const routing: Routing = {
    api: {
        v1: {
            books: {
                search: handleSearchBooks,
                ":bookId": handleGetBookDetail,  
            },
            auth: {
                login: handleLogin,
                refresh: handleRefreshToken,
                signup: handleSignup,
                logout: handleLogout,
                me: handleWithdrawUser,
            },
        },
    },
};
