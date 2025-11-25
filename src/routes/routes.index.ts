import { Routing } from "express-zod-api";
import { handleUserTest } from "../controllers/users.controller.js";

export const routing: Routing = {
    api: {
        v1: {
            users: {
                test: handleUserTest,
            },
        },
    },
};
