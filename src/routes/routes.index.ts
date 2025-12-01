import { Routing } from "express-zod-api";
import { handleSearchBooks} from "../controllers/books.controller.js";
import { handleLogin, handleRefreshToken, handleSignup } from "../controllers/auth.controller.js";

export const routing: Routing = {
    api: {
        v1: {
            books: {
                search: handleSearchBooks,
            },
            auth: {
                login: handleLogin,
                refresh: handleRefreshToken,
                signup: handleSignup,
            },
        },
    },
};
