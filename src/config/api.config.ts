import { createConfig, Documentation } from "express-zod-api";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";

dotenv.config();

export const PORT = Number(process.env.PORT) || 3000;

// 알라딘 API 설정
export const ALADIN_API_KEY = process.env.ALADIN_API_KEY || "";
export const ALADIN_BASE_URL = "http://www.aladin.co.kr/ttb/api";


export const apiConfig = createConfig({
    http: { listen: PORT },

    beforeRouting: async ({ app, getLogger }) => {
        const logger = getLogger();

        const { routing } = await import("../routes/routes.index.js");

        const documentation = new Documentation({
            routing,
            config: apiConfig,
            version: "1.0.0",
            title: "Checkmate API",
            serverUrl: `http://localhost:${PORT}`,
            composition: "inline",
        });

        const originalSpecObject = documentation.getSpecAsJson();
        const specObject = JSON.parse(originalSpecObject);

        logger.info(`Setting up Swagger UI at http://localhost:${PORT}/api-docs`);

        app.use(
            "/api-docs",
            swaggerUi.serve,
            swaggerUi.setup(specObject, {
                customSiteTitle: "Checkmate API",
            })
        );
    },
    cors: true,
    logger: {
        level: process.env.NODE_ENV === "production" ? "warn" : "debug",
        color: true,
    },
});
