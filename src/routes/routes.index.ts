import { Routing } from "express-zod-api";
import { handleSearchBooks} from "../controllers/books.controller.js";

export const routing: Routing = {
    api: {
        v1: {
            books: {
                search: handleSearchBooks,
            
            },
        },
    },
};
