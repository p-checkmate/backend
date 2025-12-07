import { createServer } from "express-zod-api";
import { apiConfig } from "./config/api.config.js";
import { routing } from "./routes/routes.index.js";
createServer(apiConfig, routing);
